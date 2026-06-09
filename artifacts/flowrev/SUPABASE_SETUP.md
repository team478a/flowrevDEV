# FlowRev — Supabase セットアップガイド

> **対象:** 初回セットアップ / データベースが空の Supabase プロジェクト  
> **前提:** Supabase プロジェクト作成済み、環境変数（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `ENCRYPTION_KEY` / `SESSION_SECRET`）設定済み

---

## 実行手順

Supabase ダッシュボード → **SQL Editor** → 各 SQL を順番に貼り付けて「RUN」。  
**必ず番号順に実行してください。** 前のステップのテーブルを参照するため、順序を守らないとエラーになります。

---

## Step 1 — コアテナント基盤

**ファイル:** `supabase/migrations/0001_core_tenant.sql`

作成されるテーブル:
| テーブル | 用途 |
|---|---|
| `plans` | WLオーナー向けプラン |
| `white_labels` | ホワイトラベル事業者 |
| `clients` | クライアント（WL配下） |
| `user_profiles` | 全ロール共通のプロフィール |
| `invitations` | クライアント招待トークン |
| `ai_provider_settings` | AI APIキー（暗号化保存） |
| `email_settings` | Resend APIキー（暗号化保存） |

```sql
-- supabase/migrations/0001_core_tenant.sql の内容をコピーして実行
```

---

## Step 2 — 商品テーブル

**ファイル:** `supabase/migrations/0002_products.sql`

作成されるテーブル: `products`

```sql
-- supabase/migrations/0002_products.sql の内容をコピーして実行
```

---

## Step 3 — LP（ランディングページ）テーブル

**ファイル:** `supabase/migrations/0003_landing_pages.sql`

作成されるテーブル: `landing_pages`

```sql
-- supabase/migrations/0003_landing_pages.sql の内容をコピーして実行
```

---

## Step 4 — フォーム送信・購入記録テーブル（補完）

> ⚠️ **このステップは独立した SQL ファイルがありません。** 以下を SQL Editor に直接貼り付けて実行してください。  
> これらのテーブルは RLS ポリシー（Step 9）で参照されるため必須です。

```sql
-- ⑧ フォーム送信（LP問い合わせログ）
CREATE TABLE IF NOT EXISTS form_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id  UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  landing_page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  data            JSONB NOT NULL,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ⑩ 購入記録（決済フェーズで使用、現在は構造のみ）
CREATE TABLE IF NOT EXISTS purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id) ON DELETE CASCADE,
  customer_id    UUID,  -- customers テーブル作成後に外部キーを追加
  product_id     UUID REFERENCES products(id),
  amount         INTEGER NOT NULL DEFAULT 0,
  currency       TEXT DEFAULT 'jpy',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Step 5 — 決済インフラテーブル

**ファイル:** `supabase/migrations/0004_payments.sql`

作成されるテーブル: `payment_providers` / `stripe_accounts` / `bank_transfer_settings` / `payment_logs` / `rate_limits`

```sql
-- supabase/migrations/0004_payments.sql の内容をコピーして実行
```

---

## Step 6 — Storage バケット（商品画像）

**ファイル:** `supabase/migrations/0004_storage.sql`

Supabase Storage に `product-images` バケットを作成し、client_id フォルダ単位のポリシーを設定します。

```sql
-- supabase/migrations/0004_storage.sql の内容をコピーして実行
```

---

## Step 7 — 顧客テーブル

**ファイル:** `supabase/migrations/0006_customers.sql`

> ⚠️ シナリオ（Step 8）が `customers` を外部参照するため、**必ずシナリオより先に実行**してください。

作成されるテーブル: `customers`

```sql
-- supabase/migrations/0006_customers.sql の内容をコピーして実行
```

purchases テーブルの外部キーを追加します（Step 4 で作成した purchases に customer_id FK を付与）:

```sql
ALTER TABLE purchases
  ADD CONSTRAINT purchases_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
```

---

## Step 8 — フォローシナリオテーブル

**ファイル:** `supabase/migrations/0005_scenarios.sql`

作成されるテーブル: `follow_scenarios` / `scenario_steps` / `scenario_logs`

```sql
-- supabase/migrations/0005_scenarios.sql の内容をコピーして実行
```

---

## Step 9 — 会員サイトテーブル

**ファイル:** `supabase/migrations/0007_members.sql`

作成されるテーブル: `courses` / `lessons` / `lesson_progress`

```sql
-- supabase/migrations/0007_members.sql の内容をコピーして実行
```

---

## Step 10 — RLS ヘルパー関数（重要）

**ファイル:** `supabase/migrations/0006_rls_functions.sql`

全テーブルの RLS を有効化し、以下の共有ヘルパー関数を作成します:

| 関数 | 返り値 | 用途 |
|---|---|---|
| `get_user_role()` | TEXT | ログインユーザーのロール |
| `get_user_client_id()` | UUID | ログインユーザーの client_id |
| `get_user_white_label_id()` | UUID | ログインユーザーの white_label_id |

> ⚠️ **このステップを飛ばすと Step 11 の RLS ポリシーが全て失敗します。**

```sql
-- supabase/migrations/0006_rls_functions.sql の内容をコピーして実行
```

---

## Step 11 — RLS ポリシー（全テーブル一括）

**ファイル:** `supabase/migrations/0007_rls_policies.sql`

4ロール（`system_admin` / `white_label_owner` / `client_owner` / `customer`）に対して全テーブルの行レベルセキュリティポリシーを設定します。  
`DROP POLICY IF EXISTS` を使用しているため**冪等**（何度実行しても安全）です。

```sql
-- supabase/migrations/0007_rls_policies.sql の内容をコピーして実行
```

---

## Step 12 — AI 設定の RLS ポリシー

**ファイル:** `supabase/migrations/0008_ai_rls.sql`

`ai_provider_settings` テーブルに system_admin 全操作ポリシーを追加します。

```sql
-- supabase/migrations/0008_ai_rls.sql の内容をコピーして実行
```

---

## Step 13 — ユーザー作成トリガー

**ファイル:** `supabase/migrations/0008_user_trigger.sql`

`auth.users` に新規ユーザーが作成されたとき `user_profiles` を自動生成するトリガーを設定します。

**セキュリティ強化点:**
- `raw_user_meta_data` の `role` を**許可リスト**で検証（`white_label_owner` / `client_owner` / `customer` のみ）
- `system_admin` はメタデータから絶対に付与しない（DB 直接操作のみ）

```sql
-- supabase/migrations/0008_user_trigger.sql の内容をコピーして実行
```

---

## Step 14 — Auth 設定（Supabase ダッシュボード）

SQL ではなくダッシュボードの GUI で設定します。

1. **Authentication → Providers**  
   → Email プロバイダーを有効化

2. **Authentication → Email Templates**  
   → 確認メールのテンプレートをブランドに合わせてカスタマイズ（任意）

3. **Authentication → URL Configuration**  
   → Site URL を本番ドメインまたは Replit プレビュー URL に設定  
   → Redirect URLs に `/auth/callback` を追加  
   例: `https://your-domain.repl.co/auth/callback`

4. **Authentication → Providers → Email → Confirm email**  
   → 開発中は OFF でも可（本番では ON 推奨）

---

## Step 15 — 初期データ投入（任意）

system_admin ユーザーと初期プランを作成します。

```sql
-- プラン初期データ
INSERT INTO plans (name, max_clients, max_products, max_customers, price_monthly) VALUES
  ('starter',    3,  10,  100,  9800),
  ('standard',  10,  50,  500, 29800),
  ('enterprise', 99, 999, 9999, 98000)
ON CONFLICT DO NOTHING;
```

system_admin ユーザーは **Supabase Authentication → Add user** から手動作成し、作成後に以下で role を付与します:

```sql
-- <user_id> を作成したユーザーの UUID に置き換える
INSERT INTO user_profiles (id, role, display_name)
VALUES ('<user_id>', 'system_admin', 'System Admin')
ON CONFLICT (id) DO UPDATE SET role = 'system_admin';
```

---

## 実行順チェックリスト

| # | ファイル | 状態 |
|---|---|---|
| 1 | `0001_core_tenant.sql` | ☐ |
| 2 | `0002_products.sql` | ☐ |
| 3 | `0003_landing_pages.sql` | ☐ |
| 4 | form_submissions / purchases（直接入力） | ☐ |
| 5 | `0004_payments.sql` | ☐ |
| 6 | `0004_storage.sql` | ☐ |
| 7 | `0006_customers.sql` + purchases FK | ☐ |
| 8 | `0005_scenarios.sql` | ☐ |
| 9 | `0007_members.sql` | ☐ |
| 10 | `0006_rls_functions.sql` | ☐ |
| 11 | `0007_rls_policies.sql` | ☐ |
| 12 | `0008_ai_rls.sql` | ☐ |
| 13 | `0008_user_trigger.sql` | ☐ |
| 14 | Auth 設定（GUI） | ☐ |
| 15 | 初期データ（任意） | ☐ |

---

## トラブルシューティング

### `function get_user_client_id() does not exist`
→ Step 10（`0006_rls_functions.sql`）が未実行です。実行後に失敗した Step を再実行してください。

### `relation "customers" does not exist`
→ Step 7（`0006_customers.sql`）を先に実行してください。`scenario_logs` が `customers` を外部参照しています。

### `relation "purchases" does not exist`
→ Step 4 の直接入力 SQL を先に実行してください。

### `policy already exists`
→ `0007_rls_policies.sql` は `DROP POLICY IF EXISTS` 付きで安全に再実行できます。それ以外のファイルは `IF NOT EXISTS` または `OR REPLACE` を確認してください。

### Storage ポリシーエラー
→ `0004_storage.sql` は Storage が有効なプロジェクトのみ動作します。Supabase ダッシュボード → Storage が有効になっているか確認してください。

---

## 環境変数リファレンス

| 変数名 | 取得場所 | 用途 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL | Supabase クライアント初期化 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon key | 公開クライアント認証 |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key | 管理クライアント（サーバー専用・公開厳禁） |
| `ENCRYPTION_KEY` | 任意の32文字以上の文字列を生成 | AI / メール APIキーの暗号化 |
| `SESSION_SECRET` | 任意の32文字以上の文字列を生成 | セッション署名 |
| `NEXT_PUBLIC_APP_URL` | デプロイ後の本番URL | 招待URLの生成（未設定時は REPLIT_DOMAINS を自動使用） |
