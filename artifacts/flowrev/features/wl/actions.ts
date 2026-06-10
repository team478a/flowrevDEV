"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import { createWLPlan, updateWLPlan, deleteWLPlan } from "@/lib/repositories/plans";
import { updateClient, toggleClientStatus } from "@/lib/repositories/clients";
import { PLAN_FEATURE_DEFS } from "@/lib/features/plan-features";

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

function extractFeatures(formData: FormData): Record<string, boolean> {
  const features: Record<string, boolean> = {};
  for (const def of PLAN_FEATURE_DEFS) {
    features[def.key] = formData.get(`feature_${def.key}`) === "on";
  }
  return features;
}

export interface CreateWLPlanState {
  error: string | null;
}

/**
 * WL オーナー用プラン作成サーバーアクション。
 * white_label_owner のみ実行可能。自分の WL に紐付いたプランを作成する。
 */
export async function createWLPlanAction(
  _prevState: CreateWLPlanState,
  formData: FormData,
): Promise<CreateWLPlanState> {
  const session = await getSessionProfile();
  if (session?.role !== "white_label_owner" || !session.whiteLabelId) {
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

  const features = extractFeatures(formData);

  try {
    await createWLPlan(session.whiteLabelId, { ...parsed.data, features });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "作成に失敗しました。" };
  }

  revalidatePath("/wl/plans");
  redirect("/wl/plans");
}

export interface ClientActionState {
  error: string | null;
}

/**
 * クライアントの事業者名を更新するサーバーアクション。
 */
export async function updateClientAction(
  id: string,
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "white_label_owner" || !session.whiteLabelId) {
    return { error: "この操作を行う権限がありません。" };
  }

  const businessName = String(formData.get("businessName") ?? "").trim();
  if (!businessName) return { error: "事業者名を入力してください。" };

  try {
    await updateClient(id, session.whiteLabelId, { businessName });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新に失敗しました。" };
  }

  revalidatePath("/wl/clients");
  redirect("/wl/clients");
}

/**
 * クライアントの停止・復活を切り替えるサーバーアクション。
 */
export async function toggleClientStatusAction(
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "white_label_owner" || !session.whiteLabelId) {
    return { error: "この操作を行う権限がありません。" };
  }

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as "active" | "suspended";
  if (!id || !["active", "suspended"].includes(status)) {
    return { error: "パラメータが不正です。" };
  }

  try {
    await toggleClientStatus(id, session.whiteLabelId, status);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "変更に失敗しました。" };
  }

  revalidatePath("/wl/clients");
  return { error: null };
}

export interface WLPlanActionState {
  error: string | null;
}

/**
 * WL プランを更新するサーバーアクション。
 */
export async function updateWLPlanAction(
  id: string,
  _prevState: WLPlanActionState,
  formData: FormData,
): Promise<WLPlanActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "white_label_owner" || !session.whiteLabelId) {
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
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };
  }

  const features = extractFeatures(formData);

  try {
    await updateWLPlan(id, session.whiteLabelId, { ...parsed.data, features });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新に失敗しました。" };
  }

  revalidatePath("/wl/plans");
  redirect("/wl/plans");
}

/**
 * WL プランを削除するサーバーアクション。
 */
export async function deleteWLPlanAction(
  _prevState: WLPlanActionState,
  formData: FormData,
): Promise<WLPlanActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "white_label_owner" || !session.whiteLabelId) {
    return { error: "この操作を行う権限がありません。" };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "パラメータが不正です。" };

  try {
    await deleteWLPlan(id, session.whiteLabelId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath("/wl/plans");
  return { error: null };
}
