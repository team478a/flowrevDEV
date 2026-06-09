-- ============================================================
-- FlowRev DB Migration 0008: ユーザー作成トリガー（§10-3）
-- 前提: 0001〜0007 を実行済み
-- auth.users への INSERT 時に user_profiles を自動生成する。
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, role, white_label_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client_owner'),
    (NEW.raw_user_meta_data->>'white_label_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
