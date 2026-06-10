---
name: Pending Supabase migrations
description: Tracks which supabase/migrations/*.sql have NOT yet been executed in the live Supabase project. Currently all applied.
---

# Pending Supabase Migrations

## Rule
Every time a new `supabase/migrations/00XX_*.sql` is created, add it here.
When the user confirms it has been executed (and it is verified against the live DB), remove the entry.

## 適用状況（2026-06-10 実DB確認・全件適用済み）

- ✅ 全23テーブル作成済み
- ✅ RLS ヘルパー関数（get_user_role / get_user_client_id / get_user_white_label_id）
- ✅ RLS ポリシー（0007_rls_policies.sql）= 15テーブル
- ✅ Storage バケット `product-images`（0004_storage.sql）
- ✅ ai_provider_settings RLS（0008_ai_rls.sql）
- ✅ ユーザー作成トリガー（0008_user_trigger.sql）— 機能テストで自動生成を確認

## Pending

- ⏳ `0009_public_lp_policy.sql` — 公開LP用ビュー `public_landing_pages`（必須）。未実行だと `/p/[slug]` が常に404。SQL Editor で実行が必要。

## How to verify against live DB（service_role キー使用）

- テーブル存在: `GET /rest/v1/<table>?select=*&limit=1` が 200 なら存在
- 通常関数: `POST /rest/v1/rpc/<fn>` が 200 なら存在（404=未作成）
- **トリガー関数は RPC で検証不可**: `RETURNS TRIGGER` 型は PostgREST が RPC 公開しないため必ず 404 になる。検証は admin API でテストユーザーを作成→user_profiles に行が出来るか確認→削除（user_profiles は auth.users への CASCADE で消える）。
- RLS ポリシー: SQL Editor で `SELECT tablename, count(*) FROM pg_policies WHERE schemaname='public' GROUP BY tablename;`
