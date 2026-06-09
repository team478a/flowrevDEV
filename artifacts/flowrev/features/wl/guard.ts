import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import { roleHomePath } from "@/features/auth/role";
import type { SessionProfile } from "@/features/auth/session";

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
  if (session.role !== "white_label_owner" || !session.whiteLabelId) {
    redirect(roleHomePath(session.role));
  }
  return { ...session, whiteLabelId: session.whiteLabelId };
}
