import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import { roleHomePath } from "@/features/auth/role";
import { getClientStatusById } from "@/lib/repositories/clients";
import { getWhiteLabel } from "@/lib/repositories/white-labels";
import type { SessionProfile } from "@/features/auth/session";

/**
 * client_owner であることを保証する。middleware に加えた多層防御。
 * client_id 未割り当て（招待受諾直後など）でも通す（ダッシュボードは表示する）。
 * clients.status が "suspended" の場合は /suspended へリダイレクトする。
 */
export async function requireClientOwner(): Promise<SessionProfile> {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "client_owner") {
    redirect("/login");
  }

  if (session.clientId) {
    const status = await getClientStatusById(session.clientId);
    if (status === "suspended") {
      redirect("/suspended");
    }
  }

  return session;
}

/**
 * white_label_owner であることを保証する。middleware に加えた多層防御。
 * white_labels.status が "suspended" の場合は /suspended へリダイレクトする。
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
    redirect("/login");
  }

  const wl = await getWhiteLabel(session.whiteLabelId);
  if (wl?.status === "suspended") {
    redirect("/suspended");
  }

  return { ...session, whiteLabelId: session.whiteLabelId };
}
