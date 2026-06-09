import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import { roleHomePath } from "@/features/auth/role";

export default async function HomePage() {
  const session = await getSessionProfile();
  // 未ログインは middleware が /login へ送るため、ここでは到達時点で
  // 認証済み。ロールに応じたホーム画面へ振り分ける。
  redirect(roleHomePath(session?.role ?? null));
}
