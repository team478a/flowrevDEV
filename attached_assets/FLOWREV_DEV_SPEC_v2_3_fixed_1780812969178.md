# FlowRev 開発仕様書 v2.3（完全版）

## Replit AIエージェント向け実装指示書

> **v2.3 変更点サマリー**
> 
> - セキュリティ強化（招待トークン・Storage RLS・レートリミット）
> - DBインデックス定義追加
> - エラーハンドリング方針追加
> - テスト方針明記
> - ログ設計追加
> - マイグレーション運用ルール追加
> - バックアップ方針追加
> - Replitエージェント運用ガイド追加
> 
> **v2.2 変更点サマリー（継承）**
> 
> - アーキテクチャ方針セクション追加（モジュール化・保守性向上）
> - Feature-based ディレクトリ構成への更新
> - コーディングルール追加（ファイル分割基準・命名規則）
> 
> **v2.1 変更点サマリー（継承）**
> 
> 1. 主要テーブルへ `white_label_id` 追加
> 1. 決済関連テーブル追加（payment_providers / stripe_accounts / bank_transfer_settings / payment_logs）
> 1. クライアント招待フロー追加（invitationsテーブル・/wl/clients/new画面）
> 1. RLS強化（WITH CHECK を全主要テーブルに追加）
> 1. Dev / Production DB分離
> 1. GitHub運用ルール明記
> 1. MVP対象外を明記

-----

## 0. この仕様書の使い方

この仕様書はReplitのAIエージェントへの**完全な実装指示**です。
セクション順に理解した上で、**Phase1から順番に**実装を開始してください。
各Phaseの完了確認後、次Phaseへ進んでください。

-----

## 1. プロジェクト概要

### プロジェクト名

FlowRev

### コンセプト

**一人でも回るAI運営システム**

コンサルティング事業者・講師・オンラインスクール運営者向けのAI運営プラットフォーム。
販売から顧客フォローまでを支援し、少人数でも事業運営が回る仕組みを提供する。

### システム階層

```
FlowRev本部（system_admin）
  └── ホワイトラベル事業者（white_label_owner）
        └── クライアント（client_owner）
              └── 顧客（customer）
```

-----

## 2. MVP対象範囲

### ✅ MVP対象

- 4階層権限管理（system_admin / white_label_owner / client_owner / customer）
- テナント管理（ホワイトラベル）
- 商品管理
- LP管理
- 顧客管理
- 会員サイト（コース・レッスン・進捗）
- フォローシナリオ（メール）
- AI文章生成（商品説明・LP・フォローメッセージ）
- クライアント招待フロー

### ❌ MVP対象外（将来フェーズ）

- 高機能LPビルダー（ドラッグ&ドロップ等）
- 複雑な代理店階層
- LINE本番連携
- SMS本番連携
- Stripe本番決済（テーブル設計のみ、実装は対象外）
- 独自ドメイン自動設定
- AI自動改善
- 高度レポート・分析

-----

## 3. 技術スタック

|領域     |技術                                  |
|-------|------------------------------------|
|フロントエンド|Next.js 14 (App Router) + TypeScript|
|UIライブラリ|Tailwind CSS + shadcn/ui            |
|バックエンド |Supabase (BaaS)                     |
|認証     |Supabase Auth                       |
|DB     |PostgreSQL (Supabase)               |
|ストレージ  |Supabase Storage                    |
|ソース管理  |GitHub                              |
|開発環境   |Replit                              |
|本番環境   |Vercel                              |

-----

## 4. 環境分離（Dev / Production）

### Supabase Dev（開発用）

- 接続元：Replit・Vercel Preview
- 用途：開発・テスト
- 決済：テストキーのみ使用

### Supabase Production（本番用）

- 接続元：Vercel Production のみ
- 用途：本番稼働

### 禁止事項

- ReplitからProduction DB接続禁止
- Vercel PreviewからProduction DB接続禁止
- 本番決済キーを開発環境へ配置禁止

### 環境変数の使い分け

```env
# .env.local（Replit）
NEXT_PUBLIC_SUPABASE_URL=https://xxx-dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=dev_service_role_key
ANTHROPIC_API_KEY=your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_xxx   # テストキーのみ

# Vercel Preview 環境変数
NEXT_PUBLIC_SUPABASE_URL=https://xxx-dev.supabase.co  # Devを使用

# Vercel Production 環境変数
NEXT_PUBLIC_SUPABASE_URL=https://xxx-prod.supabase.co  # Prodを使用
STRIPE_SECRET_KEY=sk_live_xxx   # 本番キー（Productionのみ）
```

-----

## 5. GitHub運用ルール

### ブランチ構成

|ブランチ       |用途  |デプロイ先            |
|-----------|----|-----------------|
|`main`     |本番用 |Vercel Production|
|`develop`  |開発統合|Vercel Preview   |
|`feature/*`|機能開発|-                |

### 運用フロー

```
Replit（feature/*ブランチで作業）
↓ Pull Request
develop
↓ Vercel Preview で確認
↓ Pull Request（レビュー後）
main
↓
Vercel Production
```

### 禁止事項

- `main` への直接push禁止
- `develop` への直接push禁止
- レビューなしのmainマージ禁止

-----

## 6. アーキテクチャ方針（v2.2追加）

### 6-1. 基本原則

|原則                  |内容                                                            |
|--------------------|--------------------------------------------------------------|
|**Feature-based構成** |機能ごとにディレクトリをまとめる。商品に関するものは全部 `features/products/` を見ればわかる状態にする|
|**1ファイル300行以内**     |超えたら分割を検討する                                                   |
|**関心の分離**           |UI / データ取得 / DB操作 / 型定義 を明確に分ける                               |
|**Server Actions優先**|APIルートは最小限。DB操作はServer Actionsに集約する                           |
|**型の自動生成**          |`supabase gen types typescript` でDBスキーマから型を自動生成。手書き禁止         |

### 6-2. コンポーネント3層ルール

```
Page（app/配下）
  └── Container（features/*/components/）  ← データ取得・ロジック
        └── Presentational（features/*/components/ui/）  ← 表示のみ・propsで受け取る
```

- **Page**：ルーティングのみ。ほぼ空に近い状態を維持する
- **Container**：カスタムフック呼び出し・Server Actions呼び出し
- **Presentational**：propsを受け取って表示するだけ。副作用なし

### 6-3. データフロー

```
Page
  ↓ カスタムフック（useXxx）を呼ぶ
useXxx（features/*/hooks/）
  ↓ DB操作を呼ぶ
Repository（lib/repositories/）
  ↓
DB（Supabase）

フォーム送信
  ↓ Server Actions（features/*/actions.ts）
    ↓ Zodバリデーション → Repository → DB
```

### 6-4. Zodバリデーション方針

フォームとAPIで同じスキーマを共有する。

```typescript
// features/products/schema.ts
import { z } from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(1, '商品名は必須です'),
  price: z.number().min(0),
  price_type: z.enum(['one_time', 'recurring', 'free']),
  category: z.string().optional(),
  description: z.string().optional(),
})

export type ProductInput = z.infer<typeof ProductSchema>
// この型をフォーム・Server Actions・Repositoryで共有する
```

### 6-5. 環境変数の型安全な管理

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
// ビルド時に環境変数の不足・形式エラーを検出できる
```

### 6-6. 命名規則

|種類            |規則                 |例                     |
|--------------|-------------------|----------------------|
|コンポーネント       |PascalCase         |`ProductCard.tsx`     |
|カスタムフック       |camelCase、use〜     |`useProducts.ts`      |
|Server Actions|camelCase          |`actions.ts` 内の関数     |
|Repository関数  |camelCase          |`productRepository.ts`|
|Zodスキーマ       |PascalCase + Schema|`ProductSchema`       |
|型定義           |PascalCase         |`ProductInput`        |

-----

## 7. ディレクトリ構成（Feature-based）

```
flowrev/
├── app/                                   # ルーティングのみ（Page層）
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/                       # client_owner向け
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── lp/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── scenarios/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── members/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/                             # system_admin専用
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── white-labels/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── plans/page.tsx
│   ├── wl/                                # white_label_owner専用
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   └── clients/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/page.tsx
│   ├── my/                                # customer向け
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── courses/[id]/page.tsx
│   ├── p/[slug]/page.tsx                  # LP公開ページ
│   └── api/
│       ├── invite/route.ts
│       ├── webhooks/route.ts
│       └── ai/
│           ├── generate-lp/route.ts
│           ├── generate-product/route.ts
│           └── generate-follow/route.ts
│
├── features/                              # ★ Feature-based（機能別モジュール）
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductList.tsx            # Container（一覧）
│   │   │   ├── ProductForm.tsx            # Container（作成・編集フォーム）
│   │   │   ├── ProductCard.tsx            # Presentational
│   │   │   └── AiGenerateButton.tsx       # Presentational
│   │   ├── hooks/
│   │   │   ├── useProducts.ts             # 一覧取得
│   │   │   └── useProduct.ts              # 単件取得
│   │   ├── actions.ts                     # Server Actions（CRUD）
│   │   ├── schema.ts                      # Zodスキーマ・型定義
│   │   └── types.ts
│   ├── lp/
│   │   ├── components/
│   │   │   ├── LpList.tsx
│   │   │   ├── LpForm.tsx
│   │   │   ├── LpCard.tsx
│   │   │   └── LpPreview.tsx
│   │   ├── hooks/
│   │   │   ├── useLandingPages.ts
│   │   │   └── useLandingPage.ts
│   │   ├── actions.ts
│   │   ├── schema.ts
│   │   └── types.ts
│   ├── customers/
│   │   ├── components/
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   └── CustomerTimeline.tsx       # フォローログ表示
│   │   ├── hooks/
│   │   │   ├── useCustomers.ts
│   │   │   └── useCustomer.ts
│   │   ├── actions.ts
│   │   ├── schema.ts
│   │   └── types.ts
│   ├── scenarios/
│   │   ├── components/
│   │   │   ├── ScenarioList.tsx
│   │   │   ├── ScenarioForm.tsx
│   │   │   ├── ScenarioCard.tsx
│   │   │   └── StepEditor.tsx             # ステップ追加・並び替え
│   │   ├── hooks/
│   │   │   ├── useScenarios.ts
│   │   │   └── useScenario.ts
│   │   ├── actions.ts
│   │   ├── schema.ts
│   │   └── types.ts
│   ├── members/
│   │   ├── components/
│   │   │   ├── CourseList.tsx
│   │   │   ├── CourseForm.tsx
│   │   │   ├── LessonEditor.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── hooks/
│   │   │   ├── useCourses.ts
│   │   │   └── useLessons.ts
│   │   ├── actions.ts
│   │   ├── schema.ts
│   │   └── types.ts
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── StatCards.tsx
│   │   │   ├── RecentPurchases.tsx
│   │   │   └── ScenarioChart.tsx
│   │   └── hooks/
│   │       └── useDashboardStats.ts
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── actions.ts                     # login / logout / register
│   │   └── helpers.ts
│   └── invitations/
│       ├── components/
│       │   └── InviteForm.tsx
│       ├── actions.ts
│       └── schema.ts
│
├── components/
│   ├── ui/                                # shadcn/ui（自動生成）
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── BottomNav.tsx                  # モバイル用
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # クライアントサイド
│   │   └── server.ts                      # サーバーサイド
│   ├── repositories/                      # ★ DB操作を集約
│   │   ├── productRepository.ts
│   │   ├── customerRepository.ts
│   │   ├── landingPageRepository.ts
│   │   ├── courseRepository.ts
│   │   ├── scenarioRepository.ts
│   │   └── invitationRepository.ts
│   ├── ai/
│   │   └── claude.ts
│   ├── env.ts                             # 環境変数の型安全な管理
│   └── utils.ts
│
├── types/
│   ├── database.ts                        # supabase gen types で自動生成
│   └── app.ts
│
├── middleware.ts
└── supabase/
    ├── migrations/
    └── seed.sql
```

-----

## 8. データベース設計（v2.1）

### 設計方針

- **全主要テーブルに `white_label_id` を持つ**（集計・制限を容易にするため）
- **決済テーブルはMVPでは設計のみ**（実装は将来フェーズ）
- **RLSでテナント越えを完全防止**

-----

### テーブル定義

```sql
-- ① プラン
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 'starter' | 'standard' | 'enterprise'
  max_clients INTEGER NOT NULL,
  max_products INTEGER NOT NULL,
  max_customers INTEGER NOT NULL,
  price_monthly INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ② ホワイトラベル事業者
CREATE TABLE white_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  brand_color TEXT DEFAULT '#3B82F6',
  brand_domain TEXT,
  status TEXT DEFAULT 'active',          -- 'active' | 'suspended' | 'cancelled'
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ③ クライアント
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_logo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ④ ユーザープロフィール
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                    -- 'system_admin' | 'white_label_owner' | 'client_owner' | 'customer'
  white_label_id UUID REFERENCES white_labels(id),
  client_id UUID REFERENCES clients(id),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑤ クライアント招待（修正3）
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  representative_name TEXT,
  plan_id UUID REFERENCES plans(id),
  token TEXT NOT NULL UNIQUE,            -- 招待トークン（暗号学的ランダム文字列64文字・セクション14参照）
  status TEXT DEFAULT 'pending',         -- 'pending' | 'accepted' | 'expired'
  expires_at TIMESTAMPTZ NOT NULL,       -- 招待有効期限（例：7日後）
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑥ 商品（white_label_id追加）
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  price_type TEXT DEFAULT 'one_time',    -- 'one_time' | 'recurring' | 'free'
  recurring_interval TEXT,
  thumbnail_url TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft',           -- 'draft' | 'published' | 'archived'
  ai_generated BOOLEAN DEFAULT FALSE,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑦ LP（white_label_id追加）
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT,
  form_fields JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, slug)
);

-- ⑧ フォーム送信（white_label_id追加）
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  landing_page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑨ 顧客（white_label_id追加）
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT,                           -- 'lp' | 'manual' | 'import'
  status TEXT DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  last_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, email)
);

-- ⑩ 購入記録（white_label_id追加）
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'jpy',
  payment_method TEXT,                   -- 'stripe' | 'bank_transfer' | 'manual'
  payment_status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑪ コース（white_label_id追加）
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑫ レッスン（white_label_id追加）
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT DEFAULT 'video',     -- 'video' | 'text' | 'file'
  video_url TEXT,
  text_content TEXT,
  file_url TEXT,
  duration_seconds INTEGER,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑬ 受講進捗（white_label_id追加）
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  watch_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, lesson_id)
);

-- ⑭ フォローシナリオ（white_label_id追加）
CREATE TABLE follow_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,            -- 'purchase' | 'no_action' | 'course_complete' | 'manual'
  trigger_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑮ シナリオステップ（white_label_id追加）
CREATE TABLE scenario_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  scenario_id UUID REFERENCES follow_scenarios(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  delay_days INTEGER DEFAULT 0,
  channel TEXT DEFAULT 'email',
  subject TEXT,
  body TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scenario_id, step_number)
);

-- ⑯ シナリオ実行ログ（white_label_id追加）
CREATE TABLE scenario_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- 追加
  scenario_id UUID REFERENCES follow_scenarios(id),
  step_id UUID REFERENCES scenario_steps(id),
  customer_id UUID REFERENCES customers(id),
  status TEXT DEFAULT 'pending',         -- 'pending' | 'sent' | 'failed' | 'skipped'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 決済関連テーブル（修正2）※MVPでは設計のみ・実装は将来フェーズ
-- ========================================

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

-- ㉑ レートリミット管理（Vercelサーバーレス対応・セクション14-3参照）
CREATE TABLE rate_limits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT NOT NULL,            -- 例: 'ai:user_uuid'
  count        INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key)
);
```

-----

## 9. RLS設計（v2.1 強化版）

### 方針

- **全主要テーブルに `USING`（SELECT/UPDATE/DELETE）と `WITH CHECK`（INSERT/UPDATE）の両方を設定**
- **テナント越えを二重防止**

```sql
-- ========================================
-- RLS有効化
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
ALTER TABLE payment_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits            ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ヘルパー関数
-- ========================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
  SELECT client_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_white_label_id()
RETURNS UUID AS $$
  SELECT white_label_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ========================================
-- user_profiles
-- ========================================
CREATE POLICY "自分のプロフィール参照" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "system_admin：全参照" ON user_profiles
  FOR SELECT USING (get_user_role() = 'system_admin');

CREATE POLICY "自分のプロフィール更新" ON user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ========================================
-- white_labels
-- ========================================
CREATE POLICY "white_label_owner：自テナント参照" ON white_labels
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "client_owner：所属テナント参照" ON white_labels
  FOR SELECT USING (id = get_user_white_label_id());

CREATE POLICY "system_admin：全操作" ON white_labels
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- clients
-- ========================================
CREATE POLICY "client_owner：自クライアント参照" ON clients
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "white_label_owner：配下クライアント参照" ON clients
  FOR SELECT USING (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

CREATE POLICY "white_label_owner：配下クライアント作成" ON clients
  FOR INSERT WITH CHECK (
    white_label_id = get_user_white_label_id()
    AND get_user_role() = 'white_label_owner'
  );

CREATE POLICY "system_admin：全操作" ON clients
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- invitations
-- ========================================
CREATE POLICY "white_label_owner：自テナントの招待管理" ON invitations
  FOR ALL
  USING (white_label_id = get_user_white_label_id())
  WITH CHECK (white_label_id = get_user_white_label_id());

CREATE POLICY "system_admin：全操作" ON invitations
  FOR ALL USING (get_user_role() = 'system_admin')
  WITH CHECK (get_user_role() = 'system_admin');

-- ========================================
-- products（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：自商品のみ操作" ON products
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "white_label_owner：配下商品参照" ON products
  FOR SELECT USING (white_label_id = get_user_white_label_id());

CREATE POLICY "system_admin：全参照" ON products
  FOR SELECT USING (get_user_role() = 'system_admin');

-- ========================================
-- landing_pages（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：自LPのみ操作" ON landing_pages
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "white_label_owner：配下LP参照" ON landing_pages
  FOR SELECT USING (white_label_id = get_user_white_label_id());

-- ========================================
-- customers（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：自顧客のみ操作" ON customers
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "customer：自分のレコード参照" ON customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "white_label_owner：配下顧客参照" ON customers
  FOR SELECT USING (white_label_id = get_user_white_label_id());

-- ========================================
-- purchases（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：自購入記録のみ操作" ON purchases
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "white_label_owner：配下購入記録参照" ON purchases
  FOR SELECT USING (white_label_id = get_user_white_label_id());

-- ========================================
-- courses（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：コース操作" ON courses
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "customer：購入済みコース参照" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM purchases p
      JOIN customers c ON c.id = p.customer_id
      WHERE p.product_id = courses.product_id
        AND c.user_id = auth.uid()
        AND p.payment_status = 'paid'
    )
  );

-- ========================================
-- lessons（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：レッスン操作" ON lessons
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "customer：購入済みレッスン参照" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses co
      JOIN purchases p ON p.product_id = co.product_id
      JOIN customers c ON c.id = p.customer_id
      WHERE co.id = lessons.course_id
        AND c.user_id = auth.uid()
        AND p.payment_status = 'paid'
    )
  );

-- ========================================
-- lesson_progress
-- ========================================
CREATE POLICY "customer：自分の進捗のみ操作" ON lesson_progress
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = lesson_progress.customer_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = lesson_progress.customer_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "client_owner：進捗参照" ON lesson_progress
  FOR SELECT USING (white_label_id = get_user_white_label_id());

-- ========================================
-- follow_scenarios（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：シナリオ操作" ON follow_scenarios
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

-- ========================================
-- scenario_steps（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：ステップ操作" ON scenario_steps
  FOR ALL
  USING (white_label_id = get_user_white_label_id())
  WITH CHECK (white_label_id = get_user_white_label_id());

-- ========================================
-- payment_providers / bank_transfer_settings（WITH CHECK追加）
-- ========================================
CREATE POLICY "client_owner：決済設定操作" ON payment_providers
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

CREATE POLICY "client_owner：銀行振込設定操作" ON bank_transfer_settings
  FOR ALL
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id()
    AND white_label_id = get_user_white_label_id()
  );

-- ========================================
-- stripe_accounts / payment_logs（RLS有効化済み・MVPでは実装対象外）
-- ========================================
-- stripe_accounts, payment_logsはRLS有効化のみ。ポリシーは決済実装フェーズで追加する。
```

-----

## 10. 認証フロー

### 10-1. 通常ログイン

```
1. メール・パスワードでSupabase Auth認証
2. user_profilesからroleを取得
3. ロールに応じたページへリダイレクト
   - system_admin     → /admin/dashboard
   - white_label_owner → /wl/dashboard
   - client_owner     → /dashboard
   - customer         → /my
```

### 10-2. クライアント招待フロー

```
white_label_owner
 ↓ /wl/clients/new で入力
 │  - クライアント名
 │  - 代表者名
 │  - メールアドレス
 │  - プラン
 ↓
invitationsテーブルにレコード作成（tokenは暗号学的ランダム文字列64文字・7日有効）
 ↓
招待メール送信（/api/invite）
 │  本文：招待URL https://app.flowrev.me/register?token={token}
 ↓
招待を受けた人がURLからアクセス
 ↓
/register?token={token} でトークン検証
 │  - invitationsレコードの存在・有効期限・status確認
 ↓
メール・パスワード設定でSupabase Auth登録
 │  raw_user_meta_data に role='client_owner', white_label_id, client_name を含める
 ↓
auth.usersトリガーでuser_profiles自動作成
 ↓
invitations.status を 'accepted' に更新
 ↓
clientsテーブルにレコード作成（owner_user_id設定）
 ↓
client_ownerとしてダッシュボードへ
```

### 10-3. ユーザー作成トリガー

```sql
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
```

### 10-4. middleware.ts（認証ガード）

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(/* ... */)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const role = profile?.role
    const path = request.nextUrl.pathname

    if (path.startsWith('/admin') && role !== 'system_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (path.startsWith('/wl') && role !== 'white_label_owner') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (path.startsWith('/my') && role !== 'customer') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|register|p/).*)']
}
```

-----

## 11. 画面仕様

### 11-1. ダッシュボード（/dashboard）

- 今月の売上・顧客数・LP変換率・未フォロー顧客数
- 直近5件の購入履歴
- シナリオ送信数グラフ（過去30日）

### 11-2. 商品管理（/products）

- 一覧：商品カード（名前・価格・状態・売上）
- 作成・編集：商品名・説明・価格・カテゴリ・サムネイル・AI説明文生成

### 11-3. LP管理（/lp）

- 一覧：LPカード（タイトル・閲覧数・CV率・状態）
- 作成・編集：タイトル・商品紐付け・スラッグ・フォーム設定・HTMLエディタ・AI生成・プレビュー

### 11-4. 顧客管理（/customers）

- 一覧：テーブル（名前・メール・購入数・最終アクション）・未アクションハイライト・CSV出力
- 詳細：基本情報・購入履歴・受講進捗・フォローログ・メモ・タグ

### 11-5. フォローシナリオ（/scenarios）

- 一覧：シナリオカード（名前・トリガー・ステップ数・状態）
- 作成・編集：名前・トリガー設定・ステップ追加（並び替え）・AI文章生成

### 11-6. 会員サイト管理（/members）

- コース一覧・コース編集・レッスン追加・並び替え

### 11-7. クライアント招待（/wl/clients/new）

**入力項目：**

- クライアント名（必須）
- 代表者名（必須）
- メールアドレス（必須）
- プラン選択
- 招待送信ボタン

**処理：**

1. invitationsテーブルにレコード作成
1. /api/invite でメール送信
1. 送信完了メッセージ表示

-----

## 12. AI機能仕様

### 商品説明生成 `/api/ai/generate-product`

```json
入力: { product_name, category, target_customer, price }
出力: { catch_copy, description, target_list }
```

### LP文章生成 `/api/ai/generate-lp`

```json
入力: { product_name, product_description, target_customer, price, tone }
出力: { headline, subheadline, features, faq, cta }
```

### フォローメッセージ生成 `/api/ai/generate-follow`

```json
入力: { scenario_name, trigger_type, product_name, step_number, step_delay_days, tone }
出力: { subject, body }
```

-----

## 13. MVP開発順序

### Phase 1：基盤（認証・ロール・テナント・招待）

```
実装内容：
1. Supabase Dev プロジェクト作成
2. 全テーブルのマイグレーション実行（セクション8のSQL）
3. RLS設定（セクション9のSQL）
4. DBインデックス適用（セクション15のSQL）
5. auth.usersトリガー設定（セクション10-3のSQL）
6. Next.jsプロジェクト初期化（App Router + TypeScript + Tailwind + shadcn/ui）
7. Supabaseクライアント設定
8. middleware.ts実装（セクション10-4）
9. ログイン画面（/login）
10. ユーザー登録画面（/register?token=）※招待トークン対応
11. クライアント招待画面（/wl/clients/new）
12. 招待メール送信API（/api/invite）
13. ロールベースリダイレクト

完了確認：
□ メール・パスワードでログイン/ログアウトできる
□ ロールに応じた画面へリダイレクトされる
□ white_label_ownerが招待を送れる
□ 招待URLから登録してclient_ownerになれる
□ RLSにより他テナントのデータが見えないことを確認
```

### Phase 2：商品・LP管理

```
実装内容：
1. /dashboard（レイアウト・サイドバー）
2. /products（一覧・作成・編集）
3. /lp（一覧・作成・編集）
4. Supabase Storage（画像アップロード）
5. /p/[slug]（LP公開ページ）

完了確認：
□ 商品を作成・編集・削除できる
□ LPを作成・公開できる
□ LP公開URLにアクセスできる
□ white_label_id が自動でセットされる
```

### Phase 3：会員サイト

```
実装内容：
1. /members（コース管理）
2. /my（顧客マイページ）
3. /my/courses/[id]（レッスン視聴）
4. 進捗記録

完了確認：
□ コース・レッスンを作成できる
□ customerロールでレッスン視聴できる
□ 進捗が記録される
```

### Phase 4：顧客管理・フォロー

```
実装内容：
1. /customers（一覧・詳細）
2. /scenarios（シナリオ作成・ステップ設定）
3. シナリオ自動実行バッチ（Supabase Edge Functions）
4. 未アクション顧客抽出ロジック

完了確認：
□ 顧客一覧が表示される
□ シナリオを作成・有効化できる
□ 自動メール送信が動作する（テスト）
```

### Phase 5：AI機能

```
実装内容：
1. /api/ai/* のAPI Routes実装（Anthropic Claude API）
2. 商品説明生成UI
3. LP文章生成UI
4. フォローメッセージ生成UI

完了確認：
□ AI生成ボタンで文章が生成される
□ 生成文章を編集・保存できる
```

-----

## 14. セキュリティ強化方針（v2.3追加）

### 14-1. 招待トークンの安全な生成

UUIDではなく暗号学的に安全なランダム文字列を使用する。

```typescript
// features/invitations/actions.ts
import { randomBytes } from 'crypto'

function generateInviteToken(): string {
  return randomBytes(32).toString('hex') // 64文字の16進数
}
```

トークン使用後は**即時無効化**する。

```typescript
// 登録完了後に必ず実行
await supabase
  .from('invitations')
  .update({ status: 'accepted', accepted_at: new Date().toISOString() })
  .eq('token', token)
```

### 14-2. Supabase Storage のアクセス制御

Storage バケットにもRLS相当のポリシーを設定する。

```sql
-- バケット作成（Supabaseダッシュボード or SQL）
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', false);  -- 非公開

-- ポリシー：client_ownerは自分のclient_id配下にのみアップロード可
CREATE POLICY "client_owner：自フォルダのみアップロード可"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = get_user_client_id()::text
);

CREATE POLICY "client_owner：自フォルダのみ参照可"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = get_user_client_id()::text
);
```

ファイルパスの命名規則：`{client_id}/{uuid}.{ext}`

### 14-3. AIエンドポイントのレートリミット

AIエンドポイント（`/api/ai/*`）は外部APIコストが発生するため必須。

**注意：Vercel（サーバーレス）ではリクエストごとにプロセスが独立するため、インメモリの `Map` はリセットされ機能しない。Supabaseテーブルを使ったレートリミットを実装する。**

`rate_limits` テーブルはセクション8のDB設計に定義済み。RLSはセクション9に定義済み。

```typescript
// lib/rateLimit.ts
import { createClient } from '@/lib/supabase/server'

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const supabase = createClient()
  const windowStart = new Date(Date.now() - windowMs).toISOString()

  // ウィンドウ内のレコードを取得
  const { data } = await supabase
    .from('rate_limits')
    .select('count, window_start')
    .eq('key', key)
    .single()

  if (!data || new Date(data.window_start) < new Date(windowStart)) {
    // ウィンドウリセット or 初回：カウントを1にリセット
    await supabase.from('rate_limits').upsert({ key, count: 1, window_start: new Date().toISOString() })
    return true
  }

  if (data.count >= limit) return false

  // カウントインクリメント
  await supabase.from('rate_limits').update({ count: data.count + 1 }).eq('key', key)
  return true
}

// 使用例（/api/ai/generate-product/route.ts）
// 1ユーザーあたり1分間に10回まで
const allowed = await checkRateLimit(`ai:${userId}`, 10, 60_000)
if (!allowed) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}
```

-----

## 15. DBインデックス定義（v2.3追加）

マイグレーションに必ず含めること。`rate_limits` テーブルも含む（セクション14-3参照）。

```sql
-- 顧客・商品の検索高速化
CREATE INDEX idx_products_client_id ON products(client_id);
CREATE INDEX idx_products_white_label_id ON products(white_label_id);
CREATE INDEX idx_products_status ON products(status);

CREATE INDEX idx_landing_pages_client_id ON landing_pages(client_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);

CREATE INDEX idx_customers_client_id ON customers(client_id);
CREATE INDEX idx_customers_white_label_id ON customers(white_label_id);
CREATE INDEX idx_customers_last_action_at ON customers(last_action_at);  -- 未アクション顧客抽出
CREATE INDEX idx_customers_email ON customers(email);

CREATE INDEX idx_purchases_customer_id ON purchases(customer_id);
CREATE INDEX idx_purchases_client_id ON purchases(client_id);
CREATE INDEX idx_purchases_payment_status ON purchases(payment_status);

CREATE INDEX idx_courses_client_id ON courses(client_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);

CREATE INDEX idx_lesson_progress_customer_id ON lesson_progress(customer_id);
CREATE INDEX idx_lesson_progress_course_id ON lesson_progress(course_id);

CREATE INDEX idx_scenario_logs_customer_id ON scenario_logs(customer_id);
CREATE INDEX idx_scenario_logs_status ON scenario_logs(status);
CREATE INDEX idx_scenario_logs_created_at ON scenario_logs(created_at);

CREATE INDEX idx_invitations_token ON invitations(token);       -- トークン検索
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_status ON invitations(status);

CREATE INDEX idx_rate_limits_key ON rate_limits(key);           -- レートリミット検索
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);
```

-----

## 16. エラーハンドリング方針（v2.3追加）

### 16-1. Server Actions の戻り値を統一

```typescript
// types/app.ts に追加
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// 使用例
// features/products/actions.ts
export async function createProduct(input: ProductInput): Promise<ActionResult<Product>> {
  const parsed = ProductSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: '入力内容に誤りがあります' }
  }

  const { data, error } = await supabase.from('products').insert(parsed.data).select().single()
  if (error) {
    console.error('[createProduct]', error)
    return { success: false, error: '商品の作成に失敗しました' }
  }

  return { success: true, data }
}
```

### 16-2. クライアント側の通知統一

**toast通知**（shadcn/ui の `useToast`）で統一する。エラーページへの遷移は使わない。

```typescript
// Container コンポーネントでの使用例
const result = await createProduct(formData)
if (!result.success) {
  toast({ title: 'エラー', description: result.error, variant: 'destructive' })
  return
}
toast({ title: '商品を作成しました' })
```

### 16-3. エラーの種類と対処

|エラー種別     |対処                   |ユーザーへの表示             |
|----------|---------------------|---------------------|
|バリデーションエラー|フォームにインラインエラー表示      |入力欄の下に赤字で表示          |
|DB操作エラー   |toastで通知             |「保存に失敗しました」          |
|認証エラー     |ログインページへリダイレクト       |-                    |
|APIエラー（AI）|toastで通知             |「生成に失敗しました。再試行してください」|
|レートリミット   |toastで通知             |「しばらく時間をおいて再試行してください」|
|予期しないエラー  |console.error + toast|「予期しないエラーが発生しました」    |

### 16-4. ログ出力ルール

```typescript
// エラーログのフォーマットを統一
// [機能名:関数名] エラー内容
console.error('[products:createProduct]', error)
console.error('[scenarios:sendStep]', { stepId, customerId, error })

// 本番ではconsole.errorのみ（infoやdebugは開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  console.log('[products:createProduct] created:', data.id)
}
```

-----

## 17. テスト方針（v2.3追加）

### MVPのテスト方針

**MVPではテストコード（ユニットテスト・E2E）は書かない。手動確認のみ。**

Replitエージェントにテストコードを書かせると実装が膨らみ、Phaseが進まなくなるため明示的に禁止する。

### 手動確認チェックリスト（各Phaseの完了基準）

各Phaseの実装完了時に以下を手動で確認すること。

**Phase1確認項目**

```
□ system_adminアカウントでログインできる
□ white_label_ownerアカウントでログインできる
□ client_ownerアカウントでログインできる
□ customerアカウントでログインできる
□ 各ロールが正しい画面へリダイレクトされる
□ 未認証時に/loginへリダイレクトされる
□ /adminにclient_ownerでアクセスすると/dashboardへリダイレクト
□ white_label_ownerが招待メールを送信できる
□ 招待URLから登録してclient_ownerになれる
□ 期限切れトークンで登録しようとするとエラーになる
□ 使用済みトークンで登録しようとするとエラーになる
□ client_ownerが他テナントのデータを参照できない（RLS確認）
```

**Phase2確認項目**

```
□ 商品を作成・編集・削除できる
□ 商品にサムネイル画像をアップロードできる
□ 他テナントの画像にアクセスできない
□ LPを作成・公開・非公開切り替えできる
□ /p/[slug] でLPが表示される
□ LPフォームを送信するとform_submissionsに記録される
```

### 将来フェーズでのテスト導入目安

- Phase5（AI機能）完了後にVitest（ユニットテスト）を導入
- 本番リリース前にPlaywright（E2E）を導入

-----

## 18. マイグレーション・バックアップ運用（v2.3追加）

### 18-1. マイグレーション運用ルール

```
【絶対禁止】適用済みマイグレーションファイルの編集
【必須】スキーマ変更は必ず新しいファイルで行う

命名規則：
supabase/migrations/
  ├── 20240101000000_initial_schema.sql      # テーブル作成
  ├── 20240101000001_rls_policies.sql        # RLS設定
  ├── 20240101000002_indexes.sql             # インデックス
  └── 20240115000000_add_column_xxx.sql      # 後からの変更
```

適用コマンド：

```bash
supabase db push          # Devに適用
supabase db push --linked # Productionに適用（本番作業時のみ）
```

### 18-2. バックアップ方針

**Supabase無料プランの場合**

- Point-in-time recovery非対応
- 毎週月曜に手動エクスポートを実施する

```bash
# 手動エクスポートコマンド
supabase db dump -f backup_$(date +%Y%m%d).sql
```

**Supabase Proプラン以上の場合**

- Point-in-time recovery（7日間）が自動で有効
- 追加の手動作業不要

-----

## 19. Replitエージェント運用ガイド（v2.3追加）

### 19-1. セッション開始時の定型指示

毎回のセッション冒頭に以下を貼り付ける：

```
この仕様書（FLOWREV_DEV_SPEC_v2.3）を再度確認してください。
現在のPhase：[Phase番号]
今回実装する内容：[具体的なタスク1つ]
実装前に実装計画を提示してください。承認後に実装を開始してください。
```

### 19-2. タスクの粒度ルール

|NG（大きすぎる）    |OK（適切）                               |
|-------------|-------------------------------------|
|Phase1を全部実装して|マイグレーションSQLを実行して                     |
|顧客管理を実装して    |CustomerTableコンポーネントを作成して            |
|AIを実装して      |/api/ai/generate-productのAPIルートだけ実装して|

### 19-3. エージェントへの確認指示テンプレート

実装後は必ず確認を求める：

```
実装が完了したら以下を提出してください：
1. 作成・変更したファイルの一覧
2. 動作確認方法
3. 次のステップの提案
```

### 19-4. よくある問題と対処

|問題               |対処                                |
|-----------------|----------------------------------|
|仕様と違う実装をする       |該当セクションを再掲して「この仕様に従ってください」と指示     |
|ファイルが肥大化する       |「300行を超えているので分割してください」と指示         |
|テストコードを書き始める     |「MVPではテスト不要。セクション17を確認してください」と指示  |
|Replit専用機能を使おうとする|「Replit専用機能禁止。Supabaseを使ってください」と指示|
|mainに直接pushしようとする|「feature/*ブランチで作業してください」と指示       |

-----

## 20. Replitへの最初の実装指示

以上が FlowRev 開発仕様書 v2.3 の完全内容です。

**実装開始前に以下を提出してください：**

1. **仕様全体の理解確認**：各セクションの概要を要約
1. **DB構成の確認**：テーブル数・インデックス・RLSの理解
1. **アーキテクチャの確認**：Feature-based構成・3層ルールの理解
1. **セキュリティ方針の確認**：招待トークン・Storage RLS・レートリミットの理解
1. **Phase1実装計画**：具体的な実装順序と各タスクの所要時間見積もり

**実装ルール（再掲・厳守）：**

- Phase1から順番に・1タスクずつ実装すること
- 各Phaseはfeature/*ブランチで作業すること
- Phase完了ごとにdevelopへマージしてレビューを受けること
- Replit専用機能・Replit DBは使用禁止
- mainへの直接pushは禁止
- MVPではテストコード不要（セクション17参照）
- 1ファイル300行以内を維持すること
- 実装前に必ず計画を提示し、承認を得てから実装すること

-----

*FlowRev 開発仕様書 v2.3 — ストックビジネス合同会社*