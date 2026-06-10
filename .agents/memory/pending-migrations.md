---
name: Pending Supabase migrations
description: Migrations written to repo but NOT yet executed in Supabase SQL Editor — must remind user before testing affected features.
---

# Pending Supabase Migrations

## Rule
Every time a new `supabase/migrations/00XX_*.sql` is created, add it here.
When the user confirms it has been executed, remove the entry.
DB の実適用状況は service_role キーで直接確認できる（テーブル=REST 200、関数=RPC 404判定、ポリシー=pg_policies）。

## 適用状況（2026-06-10 実DB確認）

- ✅ 全23テーブル作成済み
- ✅ RLS ヘルパー関数（get_user_role / get_user_client_id / get_user_white_label_id）作成済み
- ✅ RLS ポリシー（0007_rls_policies.sql）= 15テーブルに適用済み

## Pending（残り3つ）

| ファイル | 内容 | 判定根拠 |
|---|---|---|
| `supabase/migrations/0004_storage.sql` | `product-images` Storage バケット + ポリシー | Storage バケット一覧が空 `[]` |
| `supabase/migrations/0008_ai_rls.sql` | `ai_provider_settings` の RLS ポリシー | pg_policies 一覧に ai_provider_settings が無い |
| `supabase/migrations/0008_user_trigger.sql` | `handle_new_user` トリガー（auth.users→user_profiles 自動生成） | RPC `handle_new_user` が HTTP 404 |

**Why:** DDL は PostgREST 経由では実行不可。ユーザーが Supabase ダッシュボード SQL Editor で手動実行する必要がある。
**How to apply:** Supabase ダッシュボード → SQL Editor → ファイル内容を貼り付けて実行 → ここから該当行を削除する。
