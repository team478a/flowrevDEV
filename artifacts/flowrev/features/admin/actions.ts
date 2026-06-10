"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  createWhiteLabel,
  updateWhiteLabel,
  deleteWhiteLabel,
  toggleWhiteLabelStatus,
} from "@/lib/repositories/white-labels";
import { createPlan } from "@/lib/repositories/plans";
import { upsertHqEmailSetting } from "@/lib/repositories/email-settings";

const schema = z.object({
  brandName: z.string().trim().min(1, "ブランド名を入力してください。"),
  ownerEmail: z
    .string()
    .trim()
    .email("有効なメールアドレスを入力してください。"),
  ownerPassword: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください。"),
  ownerDisplayName: z.string().trim().optional(),
  planId: z.string().uuid().optional(),
  brandColor: z.string().trim().optional(),
});

export interface CreateWhiteLabelState {
  error: string | null;
}

/**
 * ホワイトラベル作成サーバーアクション。
 * 管理者クライアントは RLS をバイパスするため、冒頭で system_admin を再検証する。
 */
export async function createWhiteLabelAction(
  _prevState: CreateWhiteLabelState,
  formData: FormData,
): Promise<CreateWhiteLabelState> {
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") {
    return { error: "この操作を行う権限がありません。" };
  }

  const planIdRaw = String(formData.get("planId") ?? "").trim();
  const displayNameRaw = String(formData.get("ownerDisplayName") ?? "").trim();
  const brandColorRaw = String(formData.get("brandColor") ?? "").trim();

  const parsed = schema.safeParse({
    brandName: formData.get("brandName"),
    ownerEmail: formData.get("ownerEmail"),
    ownerPassword: formData.get("ownerPassword"),
    ownerDisplayName: displayNameRaw || undefined,
    planId: planIdRaw || undefined,
    brandColor: brandColorRaw || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  try {
    await createWhiteLabel(parsed.data);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "作成に失敗しました。",
    };
  }

  revalidatePath("/admin/white-labels");
  redirect("/admin/white-labels");
}

const intField = (label: string) =>
  z
    .string({ invalid_type_error: `${label}を入力してください。` })
    .trim()
    .min(1, `${label}を入力してください。`)
    .pipe(
      z.coerce
        .number({ invalid_type_error: `${label}は数値で入力してください。` })
        .int(`${label}は整数で入力してください。`)
        .min(0, `${label}は0以上で入力してください。`),
    );

const planSchema = z.object({
  name: z.string().trim().min(1, "プラン名を入力してください。"),
  priceMonthly: intField("月額"),
  maxClients: intField("最大クライアント数"),
  maxProducts: intField("最大商品数"),
  maxCustomers: intField("最大顧客数"),
});

export interface CreatePlanState {
  error: string | null;
}

/**
 * プラン作成サーバーアクション。
 * 管理者クライアントは RLS をバイパスするため、冒頭で system_admin を再検証する。
 */
export async function createPlanAction(
  _prevState: CreatePlanState,
  formData: FormData,
): Promise<CreatePlanState> {
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") {
    return { error: "この操作を行う権限がありません。" };
  }

  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    priceMonthly: formData.get("priceMonthly"),
    maxClients: formData.get("maxClients"),
    maxProducts: formData.get("maxProducts"),
    maxCustomers: formData.get("maxCustomers"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  try {
    await createPlan(parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "作成に失敗しました。" };
  }

  revalidatePath("/admin/plans");
  redirect("/admin/plans");
}

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

const wlUpdateSchema = z.object({
  brandName: z.string().trim().min(1, "ブランド名を入力してください。"),
  brandColor: z.string().trim().optional(),
  planId: z.string().uuid().optional(),
  status: z.enum(["active", "suspended"]),
});

export interface UpdateWhiteLabelState {
  error: string | null;
  success: boolean;
}

/**
 * ホワイトラベルを更新するサーバーアクション（system_admin のみ）。
 */
export async function updateWhiteLabelAction(
  id: string,
  _prevState: UpdateWhiteLabelState,
  formData: FormData,
): Promise<UpdateWhiteLabelState> {
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") {
    return { error: "この操作を行う権限がありません。", success: false };
  }

  const planIdRaw = String(formData.get("planId") ?? "").trim();
  const parsed = wlUpdateSchema.safeParse({
    brandName: formData.get("brandName"),
    brandColor: String(formData.get("brandColor") ?? "").trim() || undefined,
    planId: planIdRaw || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      success: false,
    };
  }

  try {
    await updateWhiteLabel(id, {
      brandName: parsed.data.brandName,
      brandColor: parsed.data.brandColor,
      planId: parsed.data.planId ?? null,
      status: parsed.data.status,
    });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "更新に失敗しました。",
      success: false,
    };
  }

  revalidatePath("/admin/white-labels");
  redirect("/admin/white-labels");
}

export interface DeleteWhiteLabelState {
  error: string | null;
}

/**
 * ホワイトラベルを削除するサーバーアクション（system_admin のみ）。
 */
export async function deleteWhiteLabelAction(
  id: string,
): Promise<DeleteWhiteLabelState> {
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") {
    return { error: "この操作を行う権限がありません。" };
  }

  try {
    await deleteWhiteLabel(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath("/admin/white-labels");
  return { error: null };
}

export interface ToggleWLStatusState {
  error: string | null;
}

/**
 * ホワイトラベルのステータスを切り替えるサーバーアクション（system_admin のみ）。
 */
export async function toggleWhiteLabelStatusAction(
  _prevState: ToggleWLStatusState,
  formData: FormData,
): Promise<ToggleWLStatusState> {
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") {
    return { error: "この操作を行う権限がありません。" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as "active" | "suspended";
  if (!id || !["active", "suspended"].includes(status)) {
    return { error: "パラメータが不正です。" };
  }

  try {
    await toggleWhiteLabelStatus(id, status);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "変更に失敗しました。" };
  }

  revalidatePath("/admin/white-labels");
  return { error: null };
}
