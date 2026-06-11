-- cloudflare_settings にアラートチェック履歴カラムを追加
-- last_checked_at : cron が最後に実行された日時
-- last_alerted_at : 最後にアラートメールを送信した日時
-- last_unprotected_count : 最後に検出した未保護動画件数

ALTER TABLE cloudflare_settings
  ADD COLUMN IF NOT EXISTS last_checked_at  timestamptz,
  ADD COLUMN IF NOT EXISTS last_alerted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS last_unprotected_count integer;
