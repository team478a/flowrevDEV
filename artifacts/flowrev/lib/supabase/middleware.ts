import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { roleHomePath } from "@/features/auth/role";
import { normalizeSupabaseUrl } from "./url";

/**
 * 認証不要で誰でもアクセスできるパスのプレフィックス。
 * - /login, /register        : 認証画面
 * - /reset-password          : パスワードリセット申請
 * - /update-password         : 新パスワード設定（リセットメール経由）
 * - /auth                    : Supabase コールバック
 * - /p/                      : 公開 LP（顧客向け）
 * - /api/p/                  : 公開 LP のフォーム送信 API（匿名アクセス）
 */
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/reset-password",
  "/update-password",
  "/auth",
  "/p",
  "/api/p",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * リダイレクト時に、リフレッシュ済みの Cookie を引き継ぐ。
 * 別の Response を返すと supabaseResponse の Cookie が失われるため必須。
 */
function redirectWithCookies(
  path: string,
  request: NextRequest,
  base: NextResponse,
): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url));
  base.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

/**
 * リクエストごとに Supabase セッションを更新し、§10-4 のロール別ガードを適用する。
 * App Router の middleware から呼び出す。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(normalizeSupabaseUrl(url), anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() を呼ぶことでトークンをリフレッシュし Cookie を更新する。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 未ログイン: 公開パス以外はログイン画面へ。
  if (!user) {
    if (isPublicPath(pathname)) {
      return supabaseResponse;
    }
    return redirectWithCookies("/login", request, supabaseResponse);
  }

  // ログイン済み: ロールを取得。
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? null;
  const home = roleHomePath(role);

  // ログイン済みで認証画面に来たら、ロールのホームへ。
  if (pathname === "/login" || pathname === "/register") {
    return redirectWithCookies(home, request, supabaseResponse);
  }

  // ロール別ガード（権限外は自分のホームへ戻す）。
  if (pathname.startsWith("/admin") && role !== "system_admin") {
    return redirectWithCookies(home, request, supabaseResponse);
  }
  if (pathname.startsWith("/wl") && role !== "white_label_owner") {
    return redirectWithCookies(home, request, supabaseResponse);
  }
  if (pathname.startsWith("/my") && role !== "customer") {
    return redirectWithCookies(home, request, supabaseResponse);
  }

  return supabaseResponse;
}
