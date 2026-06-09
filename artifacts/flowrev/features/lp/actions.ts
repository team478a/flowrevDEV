"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
} from "@/lib/repositories/landing-pages";
import { lpSchema } from "@/features/lp/schema";

export interface LpActionState {
  error: string | null;
  success?: boolean;
}

/**
 * LP作成サーバーアクション。client_owner のみ実行可能。
 * client_id / white_label_id はセッションから取得し、フォーム入力に依存しない。
 */
export async function createLpAction(
  _prev: LpActionState,
  formData: FormData,
): Promise<LpActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner") {
    return { error: "この操作を行う権限がありません。" };
  }
  if (!session.clientId || !session.whiteLabelId) {
    return { error: "クライアント情報が取得できませんでした。" };
  }

  const rawProductId = String(formData.get("productId") ?? "").trim();
  const parsed = lpSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    productId: rawProductId && rawProductId !== "none" ? rawProductId : undefined,
    htmlContent: formData.get("htmlContent") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  try {
    const lp = await createLandingPage({
      title: parsed.data.title,
      slug: parsed.data.slug,
      productId: parsed.data.productId || undefined,
      htmlContent: parsed.data.htmlContent,
      status: parsed.data.status,
      clientId: session.clientId,
      whiteLabelId: session.whiteLabelId,
    });
    revalidatePath("/lp");
    redirect(`/lp/${lp.id}`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    return { error: e instanceof Error ? e.message : "作成に失敗しました。" };
  }
}

/**
 * LP更新サーバーアクション。client_owner のみ実行可能。
 * RLS USING 句で自テナント以外への更新は DB レベルで拒否される。
 */
export async function updateLpAction(
  id: string,
  _prev: LpActionState,
  formData: FormData,
): Promise<LpActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner") {
    return { error: "この操作を行う権限がありません。" };
  }

  const rawProductId = String(formData.get("productId") ?? "").trim();
  const parsed = lpSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    productId: rawProductId && rawProductId !== "none" ? rawProductId : undefined,
    htmlContent: formData.get("htmlContent") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  try {
    await updateLandingPage(id, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      productId: parsed.data.productId ?? null,
      htmlContent: parsed.data.htmlContent,
      status: parsed.data.status,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新に失敗しました。" };
  }

  revalidatePath("/lp");
  revalidatePath(`/lp/${id}`);
  return { error: null, success: true };
}

/**
 * LP削除サーバーアクション。client_owner のみ実行可能。
 */
export async function deleteLpAction(id: string): Promise<LpActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner") {
    return { error: "この操作を行う権限がありません。" };
  }

  try {
    await deleteLandingPage(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath("/lp");
  redirect("/lp");
}
