import { createClient } from "@/lib/supabase/server";

export interface LandingPageRow {
  id: string;
  title: string;
  slug: string;
  htmlContent: string | null;
  productId: string | null;
  status: string;
  views: number;
  conversions: number;
  aiGenerated: boolean;
  clientId: string;
  whiteLabelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingPageInput {
  title: string;
  slug: string;
  htmlContent?: string;
  productId?: string;
  status: string;
  clientId: string;
  whiteLabelId: string;
}

export interface UpdateLandingPageInput {
  title?: string;
  slug?: string;
  htmlContent?: string;
  productId?: string | null;
  status?: string;
}

function mapRow(r: Record<string, unknown>): LandingPageRow {
  return {
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    htmlContent: (r.html_content as string) ?? null,
    productId: (r.product_id as string) ?? null,
    status: r.status as string,
    views: (r.views as number) ?? 0,
    conversions: (r.conversions as number) ?? 0,
    aiGenerated: (r.ai_generated as boolean) ?? false,
    clientId: r.client_id as string,
    whiteLabelId: r.white_label_id as string,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

const SELECT_COLS =
  "id, title, slug, html_content, product_id, status, views, conversions, ai_generated, client_id, white_label_id, created_at, updated_at";

/** LP一覧を取得する（新しい順）。RLS で自テナントのみ。 */
export async function listLandingPages(): Promise<LandingPageRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select(SELECT_COLS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`LP一覧の取得に失敗しました: ${error.message}`);
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

/** LP を1件取得する（セッションクライアント、RLS 適用）。 */
export async function getLandingPage(id: string): Promise<LandingPageRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select(SELECT_COLS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`LPの取得に失敗しました: ${error.message}`);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

/**
 * スラッグから公開LPを取得する（セッションクライアント・認証不要の公開ページ用）。
 * RLS ポリシー "public：published LP参照" が status='published' のみ許可するため、
 * 未ログインでも published レコードのみ返る。コードでも status チェックして二重防護。
 */
export async function getPublishedLandingPageBySlug(
  slug: string,
): Promise<LandingPageRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select(SELECT_COLS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`LPの取得に失敗しました: ${error.message}`);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

/** LPを作成する。client_id / white_label_id はセッションから渡す。 */
export async function createLandingPage(
  input: CreateLandingPageInput,
): Promise<LandingPageRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .insert({
      title: input.title,
      slug: input.slug,
      html_content: input.htmlContent ?? null,
      product_id: input.productId ?? null,
      status: input.status,
      client_id: input.clientId,
      white_label_id: input.whiteLabelId,
    })
    .select(SELECT_COLS)
    .single();

  if (error || !data)
    throw new Error(`LPの作成に失敗しました: ${error?.message ?? "不明"}`);
  return mapRow(data as Record<string, unknown>);
}

/** LPを更新する。RLS USING 句で自テナント以外は更新不可。 */
export async function updateLandingPage(
  id: string,
  input: UpdateLandingPageInput,
): Promise<LandingPageRow> {
  const supabase = createClient();
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) patch.title = input.title;
  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.htmlContent !== undefined) patch.html_content = input.htmlContent;
  if ("productId" in input) patch.product_id = input.productId ?? null;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from("landing_pages")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLS)
    .single();

  if (error || !data)
    throw new Error(`LPの更新に失敗しました: ${error?.message ?? "不明"}`);
  return mapRow(data as Record<string, unknown>);
}

/** LPを削除する。RLS USING 句で自テナント以外は削除不可。 */
export async function deleteLandingPage(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("landing_pages").delete().eq("id", id);
  if (error) throw new Error(`LPの削除に失敗しました: ${error.message}`);
}
