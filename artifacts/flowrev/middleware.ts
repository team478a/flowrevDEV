import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下を除く全パスにマッチ:
     * - _next/static, _next/image
     * - favicon.ico / healthz（ヘルスチェック）
     * - 拡張子付きの静的ファイル全般（画像・フォント・css・js・txt 等）
     */
    "/((?!_next/static|_next/image|favicon.ico|healthz|.*\\.[\\w]+$).*)",
  ],
};
