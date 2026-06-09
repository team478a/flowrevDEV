---
name: Pending Supabase migrations
description: Migrations written to repo but NOT yet executed in Supabase SQL Editor — must remind user before testing affected features.
---

# Pending Supabase Migrations

## Rule
Every time a new `supabase/migrations/00XX_*.sql` is created, add it here.
When the user confirms it has been executed, remove the entry.

## Pending

| ファイル | テーブル | 影響ページ | 状態 |
|---|---|---|---|
| `supabase/migrations/0002_products.sql` | `products` + RLS + インデックス | `/products` 一覧・作成・編集 | **未実行** |
| `supabase/migrations/0003_landing_pages.sql` | `landing_pages` + RLS + インデックス | `/lp` 一覧・作成・編集、`/p/[slug]` 公開ページ | **未実行** |

**注意**: 0003 は 0002（products テーブル）への外部キーがあるため、0002 → 0003 の順に実行すること。

**Why:** DDL は PostgREST 経由では実行不可。ユーザーが Supabase ダッシュボード SQL Editor で手動実行する必要がある。未実行のまま該当ページを開くと「取得に失敗しました」エラーが表示される（他ページへの影響なし）。

**How to apply:** Supabase ダッシュボード → SQL Editor → ファイル内容を貼り付けて実行 → ここから該当行を削除する。
