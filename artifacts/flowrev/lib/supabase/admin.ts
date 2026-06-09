import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "./url";

/**
 * 管理用 Supabase クライアント（サーバー専用）。
 * service_role (secret) key を使用し RLS をバイパスする。
 * 絶対にクライアント側へ渡さないこと。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase の環境変数が未設定です: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createSupabaseClient(normalizeSupabaseUrl(url), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
