---
name: Supabase public (anon) read pattern
description: How to expose published/public rows to anonymous visitors without leaking internal columns.
---

# 匿名公開リードは「列を絞ったビュー」で行う

Supabase で未ログイン（anon）に公開したい行（例: published のLP）を見せるとき、
**本体テーブルに anon の SELECT ポリシーを付けてはいけない**。

**Why:** RLS は行レベル制御で列を絞れない。anon キーは公開鍵なので、本体に
`USING (status='published')` を付けると、その行の **全カラム**（client_id / white_label_id /
views / conversions / form_fields など内部メタデータ）が PostgREST 直叩きで
全テナント横断的に読めてしまう（情報露出）。draft等の非公開行は漏れないが、列が漏れる。

**How to apply:** 公開表示に必要な最小列だけを返すビューを作り、anon にはビューのみ GRANT する。
本体テーブルには anon ポリシーを一切付けない（anon は本体に直接アクセス不可のまま）。

```sql
CREATE OR REPLACE VIEW public_x AS
  SELECT col_a, col_b FROM x WHERE status = 'published';
ALTER VIEW public_x SET (security_invoker = off);  -- 所有者権限で実行=本体RLSをバイパス
GRANT SELECT ON public_x TO anon, authenticated;
```

`security_invoker=on` にすると本体RLSを参照するため anon ポリシーが必要になり、
かつ anon が本体を直接叩けてしまうので NG。必ず off（既定）。

書き込み（公開フォーム投稿など）はサーバー側 service_role（admin client）で RLS を
バイパスして処理する設計なら、anon の INSERT ポリシーは不要。
