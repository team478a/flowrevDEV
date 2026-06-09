import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * サーバー（Server Components / Route Handlers / Server Actions）用 Supabase クライアント。
 * Cookie ベースでセッションを読み書きし、SSR での認証状態を維持する。
 * anon (publishable) key を使用し、RLS が適用される。
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase の環境変数が未設定です: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component から呼ばれた場合は set 不可。
          // middleware でセッション更新を行うため無視してよい。
        }
      },
    },
  });
}
