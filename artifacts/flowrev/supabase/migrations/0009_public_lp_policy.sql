-- ========================================
-- 公開LP（/p/[slug]）の匿名参照用ビュー
-- ========================================
-- /p/[slug] は未ログイン（anon ロール）でアクセスされる公開ページ。
-- landing_pages 本体に anon の SELECT を許可すると、status='published' の行に限っても
-- client_id / white_label_id / views / conversions / form_fields などの内部メタデータが
-- anon キー（公開鍵）経由で全テナント横断的に読めてしまう（情報露出）。
--
-- そのため本体には anon ポリシーを付けず、公開表示に必要な最小列だけを返す
-- ビュー public_landing_pages を介して anon に公開する。
-- security_invoker=off（既定）によりビューは所有者権限で実行され、
-- landing_pages の RLS をバイパスする。公開列は WHERE で published に限定済み。

-- 旧アプローチ（本体への anon ポリシー）が適用済みなら撤去
DROP POLICY IF EXISTS "public：published LP参照" ON landing_pages;

CREATE OR REPLACE VIEW public_landing_pages AS
SELECT id, title, slug, html_content
FROM landing_pages
WHERE status = 'published';

-- 明示的に所有者権限実行（= 本体 RLS をバイパス）
ALTER VIEW public_landing_pages SET (security_invoker = off);

-- anon / authenticated に公開ビューの参照のみ許可
GRANT SELECT ON public_landing_pages TO anon, authenticated;
