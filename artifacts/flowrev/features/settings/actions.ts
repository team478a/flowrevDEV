"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/features/auth/session";

export interface SettingsState {
  error: string | null;
  success: string | null;
}

const displayNameSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "表示名を入力してください。")
    .max(50, "50文字以内で入力してください。"),
});

/**
 * 表示名（display_name）を更新する。
 */
export async function updateDisplayNameAction(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await getSessionProfile();
  if (!session) return { error: "ログインが必要です。", success: null };

  const parsed = displayNameSchema.safeParse({
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      success: null,
    };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", session.userId);

  if (error) return { error: `更新に失敗しました: ${error.message}`, success: null };

  revalidatePath("/settings");
  return { error: null, success: "表示名を更新しました。" };
}

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "パスワードは8文字以上で入力してください。"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "パスワードが一致しません。",
    path: ["confirmPassword"],
  });

/**
 * パスワードを変更する（Supabase Auth）。
 */
export async function changePasswordAction(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await getSessionProfile();
  if (!session) return { error: "ログインが必要です。", success: null };

  const parsed = passwordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      success: null,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error)
    return {
      error: `パスワード変更に失敗しました: ${error.message}`,
      success: null,
    };

  return { error: null, success: "パスワードを変更しました。" };
}
