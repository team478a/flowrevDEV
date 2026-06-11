-- ============================================================
-- Cloudflare Stream 動画ホスティング対応マイグレーション
-- Supabase SQL Editor で実行する。
-- ============================================================

-- Cloudflare システム設定テーブル（system_admin のみ管理）
CREATE TABLE IF NOT EXISTS cloudflare_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT,
  api_token_enc TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cloudflare_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_admin: cloudflare_settings 全操作"
  ON cloudflare_settings FOR ALL
  USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- レッスンテーブルに動画タイプと Cloudflare 動画 ID カラムを追加
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'url';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS cloudflare_video_id TEXT;
