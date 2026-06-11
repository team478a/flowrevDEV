-- cloudflare_settings テーブルにアラート通知先メールアドレスを追加
-- カンマ区切りで複数メールアドレスを保存する（例: "admin@example.com,monitor@example.com"）
-- NULL のとき、check-unprotected-videos cron は system_admin の auth メールへフォールバックする

ALTER TABLE cloudflare_settings
  ADD COLUMN IF NOT EXISTS alert_emails text;

COMMENT ON COLUMN cloudflare_settings.alert_emails
  IS '未保護動画アラートの送信先（カンマ区切り複数可）。NULL のとき system_admin にフォールバック。';
