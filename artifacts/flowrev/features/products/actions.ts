"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
} from "@/lib/repositories/products";
import { productSchema } from "@/features/products/schema";
import {
  uploadProductImage,
  deleteProductImage,
  getProductImageSignedUrl,
} from "@/lib/storage";

export interface ProductActionState {
  error: string | null;
  success?: boolean;
}

export interface UploadImageState {
  error: string | null;
  signedUrl?: string | null;
}

/**
 * 商品作成サーバーアクション。client_owner のみ実行可能。
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

/**
 * 商品サムネイル画像アップロードサーバーアクション。
 *
 * セキュリティ設計：
 * - productId の所有確認は getProduct()（RLSセッションクライアント）で行う。
 *   他テナントの productId を渡した場合は null が返り処理を中断する。
 * - 旧画像パスはクライアントから受け取らず、DB から取得する。
 *   これにより admin クライアントを用いた任意パス削除（IDOR）を防止する。
 */
export async function uploadProductImageAction(
  productId: string,
  _prev: UploadImageState,
  formData: FormData,
): Promise<UploadImageState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner") {
    return { error: "この操作を行う権限がありません。" };
  }
  if (!session.clientId) {
    return { error: "クライアント情報が取得できませんでした。" };
  }

  // RLS セッションクライアントで商品所有確認（他テナント → null）
  const existing = await getProduct(productId);
  if (!existing) {
    return { error: "商品が見つかりません。" };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "画像ファイルを選択してください。" };
  }

  let newPath: string;
  try {
    newPath = await uploadProductImage(file, session.clientId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "アップロードに失敗しました。" };
  }

  try {
    await updateProduct(productId, { thumbnailUrl: newPath });
  } catch (e) {
    // DB 更新失敗 → アップロード済みファイルを削除してロールバック
    await deleteProductImage(newPath).catch(() => null);
    return { error: e instanceof Error ? e.message : "サムネイルの保存に失敗しました。" };
  }

  // 旧画像を DB から取得したパスで削除（IDOR 防止）
  const oldPath = existing.thumbnailUrl;
  if (oldPath && oldPath !== newPath) {
    await deleteProductImage(oldPath).catch(() => null);
  }

  const signedUrl = await getProductImageSignedUrl(newPath);
  revalidatePath(`/products/${productId}`);
  return { error: null, signedUrl };
}
