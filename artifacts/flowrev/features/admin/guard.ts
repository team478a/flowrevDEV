import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import { roleHomePath } from "@/features/auth/role";

/**
 * system_admin であることを保証する。middleware に加えた多層防御。
 * 管理者クライアント（RLSバイパス）を使うページ/アクションの冒頭で呼ぶ。
 * 権限がない場合は自分のホーム（未ログインなら /login）へリダイレクトする。
 */
export async function requireSystemAdmin() {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "system_admin") {
    redirect(roleHomePath(session.role));
  }
  return session;
}
