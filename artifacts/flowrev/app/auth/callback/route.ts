import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/features/auth/session";
import { roleHomePath } from "@/features/auth/role";

/**
 * Supabase 認証コールバック。
 * メール確認リンク・マジックリンク・パスワードリセット等の code を
 * session に交換し、next パラメータ優先でリダイレクトする。
 * next が無い場合はロールに応じたホーム画面へ。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const session = await getSessionProfile();
  const dest = session ? roleHomePath(session.role) : "/login";

  return NextResponse.redirect(`${origin}${dest}`);
}
