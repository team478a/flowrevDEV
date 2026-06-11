"use server";

import { getSessionProfile } from "@/features/auth/session";
import { redirect } from "next/navigation";
import { upsertLineSettings } from "@/lib/repositories/line-settings";

export interface LineSettingsActionResult {
  error: string | null;
}

export async function saveLineSettingsAction(
  formData: FormData,
): Promise<LineSettingsActionResult> {
  const session = await getSessionProfile();
  if (!session || session.role !== "client_owner") redirect("/login");
  if (!session.clientId) {
    return { error: "クライアント情報が取得できません。" };
  }

  const channelAccessToken = (
    (formData.get("channelAccessToken") as string | null) ?? ""
  ).trim();
  const channelSecret = (
    (formData.get("channelSecret") as string | null) ?? ""
  ).trim();
  const lineFriendUrl = (
    (formData.get("lineFriendUrl") as string | null) ?? ""
  ).trim();

  try {
    await upsertLineSettings(session.clientId, {
      channelAccessToken: channelAccessToken || undefined,
      channelSecret: channelSecret || undefined,
      lineFriendUrl: lineFriendUrl || null,
    });
    return { error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存に失敗しました。";
    return { error: msg };
  }
}
