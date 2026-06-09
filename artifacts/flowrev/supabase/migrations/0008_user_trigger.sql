-- ============================================================
-- FlowRev DB Migration 0008: ユーザー作成トリガー（§10-3 / セキュリティ強化版）
-- 前提: 0001〜0007 を実行済み
-- auth.users への INSERT 時に user_profiles を自動生成する。
--
-- 【強化点】自己申告データ（raw_user_meta_data）の無条件信用による権限昇格を防止:
--   * role は許可リスト（white_label_owner / client_owner / customer）のみ採用。
--     未知の値・null は最も権限の低い 'customer' にフォールバック。
--   * 'system_admin' はメタデータから絶対に付与しない（DBで直接昇格させる運用）。
--   * 正規の役割割り当ては、招待受諾・管理者によるユーザー作成など
--     サーバー側（service_role）の信頼できる経路でのみメタデータを設定すること。
--     公開サインアップは Supabase Auth 設定で無効化する前提。
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT := NEW.raw_user_meta_data->>'role';
  safe_role TEXT;
BEGIN
  -- system_admin は付与不可。許可リスト外は customer にフォールバック。
  IF requested_role IN ('white_label_owner', 'client_owner', 'customer') THEN
    safe_role := requested_role;
  ELSE
    safe_role := 'customer';
  END IF;

  INSERT INTO public.user_profiles (id, role, white_label_id, client_id, display_name)
  VALUES (
    NEW.id,
    safe_role,
    (NEW.raw_user_meta_data->>'white_label_id')::UUID,
    (NEW.raw_user_meta_data->>'client_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
