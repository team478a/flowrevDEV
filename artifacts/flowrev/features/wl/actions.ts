"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import { createWLPlan } from "@/lib/repositories/plans";

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

  try {
    await createWLPlan(session.whiteLabelId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "作成に失敗しました。" };
  }

  revalidatePath("/wl/plans");
  redirect("/wl/plans");
}
