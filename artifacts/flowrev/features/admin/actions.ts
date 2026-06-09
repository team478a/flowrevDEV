"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import { createWhiteLabel } from "@/lib/repositories/white-labels";
import { createPlan } from "@/lib/repositories/plans";

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
