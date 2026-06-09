-- ============================================================
-- FlowRev DB Migration 0006: RLS有効化 + ヘルパー関数（強化版）
-- 前提: 0001〜0005 を実行済み
-- 実行順: 0006 → 0007 → 0008
-- ============================================================

-- ========================================
-- RLS有効化（「Run and enable RLS」で有効化済みでも冪等に再確認）
-- ========================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE white_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transfer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- 独自2テーブル（server/admin 専用のため RLS のみ有効化・ポリシー無し）
ALTER TABLE ai_provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ヘルパー関数
-- SECURITY DEFINER で user_profiles を参照し RLS 再帰を回避。
-- search_path を固定し関数経由の権限昇格を防止（強化）。
-- 参照するのは「コミット済みの自分の行」なので、UPDATE時の WITH CHECK で
-- 変更前の値との比較にも利用できる（role/テナント改竄の防止）。
-- ========================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
  SELECT client_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION get_user_white_label_id()
RETURNS UUID AS $$
  SELECT white_label_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, pg_temp;
