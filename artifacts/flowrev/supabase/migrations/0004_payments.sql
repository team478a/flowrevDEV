-- ============================================================
-- FlowRev DB Migration 0004: 決済関連（MVPは設計のみ）+ レートリミット
-- 前提: 0001, 0002 を実行済み
-- ============================================================

-- ⑰ 決済プロバイダ設定
CREATE TABLE payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,                -- 'stripe' | 'bank_transfer'
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑱ Stripeアカウント設定
CREATE TABLE stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  stripe_account_id TEXT,               -- Stripe Connect account ID
  access_token_enc TEXT,                -- 暗号化済みアクセストークン
  is_live BOOLEAN DEFAULT FALSE,        -- テスト/本番フラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑲ 銀行振込設定
CREATE TABLE bank_transfer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  bank_name TEXT,
  branch_name TEXT,
  account_type TEXT,                     -- 'ordinary' | 'checking'
  account_number TEXT,
  account_holder TEXT,
  notes TEXT,                            -- 振込時の注意事項等
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑳ 決済ログ
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES purchases(id),
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,              -- 'charge.succeeded' | 'charge.failed' 等
  raw_payload JSONB,                     -- Webhookのrawデータ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ㉑ レートリミット管理（Vercelサーバーレス対応・§14-3）
CREATE TABLE rate_limits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT NOT NULL,            -- 例: 'ai:user_uuid'
  count        INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key)
);
