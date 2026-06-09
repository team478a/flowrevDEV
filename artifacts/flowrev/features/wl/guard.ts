import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import { roleHomePath } from "@/features/auth/role";
import type { SessionProfile } from "@/features/auth/session";

/**
 * client_owner であることを保証する。middleware に加えた多層防御。
 * client_id 未割り当て（招待受諾直後など）でも通す（ダッシュボードは表示する）。
 * 権限がない場合は自分のホーム（未ログインなら /login）へリダイレクトする。
 */
export async function requireClientOwner(): Promise<SessionProfile> {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "client_owner") {
    // role=null/unknown の場合 roleHomePath は /dashboard を返し自己ループになるため
    // 権限外は必ず /login へ退避する。
    redirect("/login");
  }
  return session;
}

/**
 * white_label_owner であることを保証する。middleware に加えた多層防御。
 * テナント配下の操作を行うページ/アクションの冒頭で呼ぶ。
 * 権限がない場合は自分のホーム（未ログインなら /login）へリダイレクトする。
 * white_label_id 未割り当ての場合もホームへ戻す。
 */
export async function requireWhiteLabelOwner(): Promise<
  SessionProfile & { whiteLabelId: string }
> {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "white_label_owner") {
    redirect(roleHomePath(session.role));
  }
  if (!session.whiteLabelId) {
    // white_label_id 未割り当て: roleHomePath は /wl/dashboard を返し自己ループになるため
    // /login へ退避する。
    redirect("/login");
  }
  return { ...session, whiteLabelId: session.whiteLabelId };
}
