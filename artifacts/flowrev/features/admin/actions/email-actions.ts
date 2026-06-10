"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/features/auth/session";
import { upsertHqEmailSetting } from "@/lib/repositories/email-settings";

const emailSettingSchema = z.object({
  apiKey: z.string().trim().min(1, "Resend APIキーを入力してください。"),
  fromEmail: z
    .string()
    .trim()
    .email("有効な送信元メールアドレスを入力してください。"),
  fromName: z.string().trim().optional(),
});

export interface SaveEmailSettingState {
  error: string | null;
  success: boolean;
}

/**
 * HQ共通メール設定（Resend）保存サーバーアクション。
 * 管理者クライアントは RLS をバイパスするため、冒頭で system_admin を再検証する。
 * APIキーはリポジトリ側で暗号化して保存する。
 */
export async function saveEmailSettingAction(
  _prevState: SaveEmailSettingState,
  formData: FormData,
): Promise<SaveEmailSettingState> {
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") {
    return { error: "この操作を行う権限がありません。", success: false };
  }

  const fromNameRaw = String(formData.get("fromName") ?? "").trim();
  const parsed = emailSettingSchema.safeParse({
    apiKey: formData.get("apiKey"),
    fromEmail: formData.get("fromEmail"),
    fromName: fromNameRaw || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      success: false,
    };
  }

  try {
    await upsertHqEmailSetting({
      apiKey: parsed.data.apiKey,
      fromEmail: parsed.data.fromEmail,
      fromName: parsed.data.fromName,
    });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "保存に失敗しました。",
      success: false,
    };
  }

  revalidatePath("/admin/settings/email");
  return { error: null, success: true };
}
