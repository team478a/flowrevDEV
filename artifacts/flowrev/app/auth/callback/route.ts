import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/features/auth/session";
import { roleHomePath } from "@/features/auth/role";

/**
 * Supabase 認証コールバック。
 * メール確認リンク・マジックリンク等の code を session に交換し、
 * ロールに応じたホーム画面へリダイレクトする。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const session = await getSessionProfile();
  const dest = session ? roleHomePath(session.role) : "/login";

  return NextResponse.redirect(`${origin}${dest}`);
}
