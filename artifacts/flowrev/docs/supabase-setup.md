# Supabase SQL Editor セットアップ手順

Supabase の SQL Editor（Dashboard → SQL Editor）で以下の SQL を**順番通りに**実行してください。
各ステップは「新しいクエリ」タブを開いて SQL を貼り付け → 「Run」で実行します。

---

## 実行済み（適用確認済み）

以下は 2026-06-10 時点で実DB適用済みです。再実行不要。

- `0001` ～ `0008` コアテーブル・RLS・ストレージ・トリガー
- ✅ 全23テーブル作成済み
- ✅ RLS ヘルパー関数（`get_user_role` / `get_user_client_id` / `get_user_white_label_id`）
- ✅ ユーザー作成トリガー（`user_profiles` 自動生成）

---

## 未実行（要適用）

### ステップ 1 — 公開 LP ビュー（`0009_public_lp_policy.sql`）

> `/p/[slug]` の公開LPページが404になる場合はこれが原因です。

```sql
-- 旧ポリシーが存在する場合は削除
DROP POLICY IF EXISTS "public：published LP参照" ON landing_pages;

CREATE OR REPLACE VIEW public_landing_pages AS
SELECT id, title, slug, html_content
FROM landing_pages
WHERE status = 'published';

ALTER VIEW public_landing_pages SET (security_invoker = off);

GRANT SELECT ON public_landing_pages TO anon, authenticated;
```

---

### ステップ 2 — Stripe 決済サポート（`0010_stripe_payments.sql`）

> Stripe 決済機能を有効化する前に実行してください。

```sql
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE stripe_accounts ADD COLUMN IF NOT EXISTS webhook_secret_enc TEXT;

-- ポリシーが既存でも安全に再作成できるよう DROP IF EXISTS を先に実行
DROP POLICY IF EXISTS "client_owner: payment_providers管理" ON payment_providers;
CREATE POLICY "client_owner: payment_providers管理" ON payment_providers
  FOR ALL
  USING (get_user_role() = 'client_owner' AND client_id = get_user_client_id())
  WITH CHECK (get_user_role() = 'client_owner' AND client_id = get_user_client_id());

DROP POLICY IF EXISTS "service_role: bypass payment_providers" ON payment_providers;
CREATE POLICY "service_role: bypass payment_providers" ON payment_providers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "client_owner: stripe_accounts管理" ON stripe_accounts;
CREATE POLICY "client_owner: stripe_accounts管理" ON stripe_accounts
  FOR ALL
  USING (get_user_role() = 'client_owner' AND client_id = get_user_client_id())
  WITH CHECK (get_user_role() = 'client_owner' AND client_id = get_user_client_id());

DROP POLICY IF EXISTS "service_role: bypass stripe_accounts" ON stripe_accounts;
CREATE POLICY "service_role: bypass stripe_accounts" ON stripe_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "client_owner: payment_logs閲覧" ON payment_logs;
CREATE POLICY "client_owner: payment_logs閲覧" ON payment_logs
  FOR SELECT
  USING (get_user_role() = 'client_owner' AND client_id = get_user_client_id());

DROP POLICY IF EXISTS "service_role: bypass payment_logs" ON payment_logs;
CREATE POLICY "service_role: bypass payment_logs" ON payment_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role: bypass purchases" ON purchases;
CREATE POLICY "service_role: bypass purchases" ON purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id
  ON purchases(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
```

---

### ステップ 3 — Cloudflare Stream（`add_cloudflare_stream.sql`）

> Cloudflare Stream 動画機能全般の基盤。**ステップ 4〜8 より先に実行してください。**

```sql
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

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'url';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS cloudflare_video_id TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS cloudflare_video_status TEXT DEFAULT 'pending';

UPDATE lessons
SET cloudflare_video_status = 'ready'
WHERE cloudflare_video_id IS NOT NULL;

ALTER TABLE cloudflare_settings ADD COLUMN IF NOT EXISTS webhook_secret_enc TEXT;
```

---

### ステップ 4 — Cloudflare 一括保護ログ（`add_cloudflare_protect_logs.sql`）

> 動画の一括保護（requiresignedurls）実行履歴を記録するテーブル。

```sql
CREATE TABLE IF NOT EXISTS cloudflare_protect_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total       INTEGER NOT NULL DEFAULT 0,
  updated     INTEGER NOT NULL DEFAULT 0,
  failed      INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE cloudflare_protect_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_admin can select protect logs"
  ON cloudflare_protect_logs FOR SELECT
  USING (get_user_role() = 'system_admin');

CREATE POLICY "system_admin can insert protect logs"
  ON cloudflare_protect_logs FOR INSERT
  WITH CHECK (get_user_role() = 'system_admin');
```

---

### ステップ 5 — 保護ログにエラー詳細追加（`add_error_details_to_protect_logs.sql`）

> **ステップ 4 の後に実行。** 失敗した動画IDを管理画面で確認できるようにします。

```sql
ALTER TABLE cloudflare_protect_logs
  ADD COLUMN IF NOT EXISTS error_details JSONB;
```

---

### ステップ 6 — Cloudflare Webhook 受信ログ（`add_cloudflare_webhook_logs.sql`）

> Stream の Webhook（トランスコード完了通知）の受信履歴テーブル。

```sql
CREATE TABLE IF NOT EXISTS cloudflare_webhook_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  video_id    TEXT,
  status      TEXT,
  result      TEXT NOT NULL,
  detail      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cloudflare_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_admin: cloudflare_webhook_logs 全操作"
  ON cloudflare_webhook_logs FOR ALL
  USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

CREATE INDEX IF NOT EXISTS cloudflare_webhook_logs_received_at_idx
  ON cloudflare_webhook_logs (received_at DESC);
```

---

### ステップ 7 — アラート通知先メール（`add_alert_emails_to_cloudflare_settings.sql`）

> 未保護動画アラートの送信先を管理画面から変更できるようにします。

```sql
ALTER TABLE cloudflare_settings
  ADD COLUMN IF NOT EXISTS alert_emails TEXT;

COMMENT ON COLUMN cloudflare_settings.alert_emails
  IS '未保護動画アラートの送信先（カンマ区切り複数可）。NULL のとき system_admin にフォールバック。';
```

---

### ステップ 8 — Cron 実行タイムスタンプ（`add_cron_timestamps_to_cloudflare_settings.sql`）

> 管理画面の「最終チェック日時」「最終通知日時」表示に使います。

```sql
ALTER TABLE cloudflare_settings
  ADD COLUMN IF NOT EXISTS last_checked_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_alerted_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_unprotected_count INTEGER;
```

---

### ステップ 9 — 未保護動画チェックログ（`add_video_check_logs.sql`）

> 毎日の自動チェック結果を蓄積し、管理画面のグラフに表示します。

```sql
CREATE TABLE IF NOT EXISTS video_check_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unprotected INTEGER NOT NULL DEFAULT 0,
  total       INTEGER NOT NULL DEFAULT 0,
  notified    BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE video_check_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_admin can select video check logs"
  ON video_check_logs FOR SELECT
  USING (get_user_role() = 'system_admin');

CREATE POLICY "system_admin can insert video check logs"
  ON video_check_logs FOR INSERT
  WITH CHECK (get_user_role() = 'system_admin');
```

---

### ステップ 10 — clients テーブルに plan_id カラム追加

> 招待登録時に「plan_id column not found」エラーが出る場合はこれが原因です。

```sql
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE SET NULL;
```

---

### ステップ 11 — LINE 連携サポート（`add_line_support.sql`）

> LP 管理で「line_add_url does not exist」エラーが出る場合はこれが原因です。

```sql
-- LINE アカウント設定テーブル
CREATE TABLE IF NOT EXISTS line_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  channel_access_token_enc TEXT,
  channel_secret_enc TEXT,
  line_friend_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE line_accounts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_line_accounts_client_id ON line_accounts(client_id);

DROP POLICY IF EXISTS "client_owner: line_accounts 自テナント管理" ON line_accounts;
CREATE POLICY "client_owner: line_accounts 自テナント管理"
  ON line_accounts FOR ALL
  USING (get_user_role() = 'client_owner' AND client_id = get_user_client_id())
  WITH CHECK (get_user_role() = 'client_owner' AND client_id = get_user_client_id());

DROP POLICY IF EXISTS "system_admin: line_accounts 全操作" ON line_accounts;
CREATE POLICY "system_admin: line_accounts 全操作"
  ON line_accounts FOR ALL
  USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- 顧客テーブルに LINE ユーザー ID カラムを追加
ALTER TABLE customers ADD COLUMN IF NOT EXISTS line_user_id TEXT;

-- LP テーブルに LINE 友だち追加 URL カラムを追加
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS line_add_url TEXT;
```

---

## 適用後の確認方法

SQL Editor で以下を実行し、テーブルが存在することを確認してください。

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

期待するテーブル一覧に以下が含まれていれば OK です：
- `cloudflare_settings`
- `cloudflare_protect_logs`
- `cloudflare_webhook_logs`
- `video_check_logs`
- `public_landing_pages`（ビュー）

---

## よくある確認クエリ

```sql
-- cloudflare_settings のカラム確認
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cloudflare_settings'
ORDER BY ordinal_position;

-- lessons テーブルに動画カラムが追加されているか確認
SELECT column_name FROM information_schema.columns
WHERE table_name = 'lessons'
  AND column_name IN ('video_type', 'cloudflare_video_id', 'cloudflare_video_status');

-- RLS ポリシー一覧
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
