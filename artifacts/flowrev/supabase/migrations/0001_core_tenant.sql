-- ============================================================
-- FlowRev DB Migration 0001: コアテナント + 設定テーブル
-- 実行順: 0001 → 0002 → 0003 → 0004 → 0005
-- Supabase ダッシュボードの SQL Editor で順番に実行する。
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

-- ⑤ クライアント招待
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  representative_name TEXT,
  plan_id UUID REFERENCES plans(id),
  token TEXT NOT NULL UNIQUE,            -- 暗号学的ランダム文字列64文字（§14）
  status TEXT DEFAULT 'pending',         -- 'pending' | 'accepted' | 'expired'
  expires_at TIMESTAMPTZ NOT NULL,       -- 招待有効期限（例：7日後）
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI / メール設定（仕様の21テーブルに加えた FlowRev 独自テーブル）
-- ハイブリッド方式: white_label_id = NULL を HQ 共通設定、
-- white_label_id 指定をホワイトラベル個別の上書きとする。
-- APIキーは ENCRYPTION_KEY で暗号化した文字列を *_enc 列に保存する。
-- ============================================================

-- AI プロバイダ設定
CREATE TABLE ai_provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- NULL = HQ共通
  provider TEXT NOT NULL,                -- 'anthropic' | 'openai'
  api_key_enc TEXT NOT NULL,             -- 暗号化済みAPIキー
  model TEXT,                            -- 既定モデル名
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HQ共通は provider ごとに1件、WL別は (white_label_id, provider) で1件
CREATE UNIQUE INDEX uq_ai_provider_hq
  ON ai_provider_settings(provider) WHERE white_label_id IS NULL;
CREATE UNIQUE INDEX uq_ai_provider_wl
  ON ai_provider_settings(white_label_id, provider) WHERE white_label_id IS NOT NULL;

-- メール（Resend）設定
CREATE TABLE email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_label_id UUID REFERENCES white_labels(id) ON DELETE CASCADE,  -- NULL = HQ共通
  provider TEXT NOT NULL DEFAULT 'resend',
  api_key_enc TEXT NOT NULL,             -- 暗号化済みAPIキー
  from_email TEXT,
  from_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_email_settings_hq
  ON email_settings(provider) WHERE white_label_id IS NULL;
CREATE UNIQUE INDEX uq_email_settings_wl
  ON email_settings(white_label_id, provider) WHERE white_label_id IS NOT NULL;
