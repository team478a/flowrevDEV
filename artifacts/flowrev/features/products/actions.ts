"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/repositories/products";
import { productSchema } from "@/features/products/schema";

export interface ProductActionState {
  error: string | null;
  success?: boolean;
}

/**
 * 商品作成サーバーアクション。client_owner のみ実行可能。
 * client_id / white_label_id はセッションから取得し、フォーム入力に依存しない。
 */
export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner") {
    return { error: "この操作を行う権限がありません。" };
  }
  if (!session.clientId || !session.whiteLabelId) {
    return { error: "クライアント情報が取得できませんでした。" };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    priceType: formData.get("priceType"),
    category: formData.get("category") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  try {
    const product = await createProduct({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      priceType: parsed.data.priceType,
      category: parsed.data.category,
      status: parsed.data.status,
      clientId: session.clientId,
      whiteLabelId: session.whiteLabelId,
    });
    revalidatePath("/products");
    redirect(`/products/${product.id}`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    return { error: e instanceof Error ? e.message : "作成に失敗しました。" };
  }
}

/**
 * 商品更新サーバーアクション。client_owner のみ実行可能。
 * RLS USING 句で自テナント以外への更新は DB レベルで拒否される。
 */
export async function updateProductAction(
  id: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner") {
    return { error: "この操作を行う権限がありません。" };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    priceType: formData.get("priceType"),
    category: formData.get("category") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  try {
    await updateProduct(id, {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      priceType: parsed.data.priceType,
      category: parsed.data.category,
      status: parsed.data.status,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新に失敗しました。" };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { error: null, success: true };
}

/**
 * 商品削除サーバーアクション。client_owner のみ実行可能。
 */
export async function deleteProductAction(
  id: string,
): Promise<ProductActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner") {
    return { error: "この操作を行う権限がありません。" };
  }

  try {
    await deleteProduct(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath("/products");
  redirect("/products");
}
