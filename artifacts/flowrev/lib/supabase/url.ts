/**
 * NEXT_PUBLIC_SUPABASE_URL を正規化する。
 * Supabase クライアントはプロジェクトのベース URL を期待するが、
 * ダッシュボードからコピーした際に `/rest/v1/` や末尾スラッシュが
 * 付いていると全リクエストのパスが壊れる（"Invalid path specified in request URL"）。
 * ここでベース URL（origin）のみに整える。
 */
export function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  try {
    // origin のみを使うことで /rest/v1 や /auth/v1、末尾スラッシュを除去する。
    return new URL(trimmed).origin;
  } catch {
    // URL として解釈できない場合は末尾スラッシュだけ落として返す。
    return trimmed.replace(/\/+$/, "");
  }
}
