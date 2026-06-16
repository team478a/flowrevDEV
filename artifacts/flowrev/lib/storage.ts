import "server-only";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "product-images";
const SIGNED_URL_EXPIRES = 60 * 60; // 1時間

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

type AllowedMime = (typeof ALLOWED_MIME)[number];

function isAllowedMime(mime: string): mime is AllowedMime {
  return (ALLOWED_MIME as readonly string[]).includes(mime);
}

function extFromMime(mime: AllowedMime): string {
  const map: Record<AllowedMime, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mime];
}

/**
 * 商品サムネイルを Storage にアップロードする。
 * パス: `{clientId}/{uuid}.{ext}`
 * @returns Storage 上のファイルパス（DB に保存する値）
 */
export async function uploadProductImage(
  file: File,
  clientId: string,
): Promise<string> {
  if (!isAllowedMime(file.type)) {
    throw new Error("JPG・PNG・WebP のみアップロードできます。");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("ファイルサイズは 5MB 以内にしてください。");
  }

  const ext = extFromMime(file.type);
  const path = `${clientId}/${randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }

  return path;
}

/**
 * Storage パスから署名付き URL（1時間有効）を生成する。
 * パスが null / 空の場合は null を返す。
 */
export async function getProductImageSignedUrl(
  path: string | null,
): Promise<string | null> {
  if (!path) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Storage からファイルを削除する。エラーは握りつぶし（DB更新側を優先）。
 */
export async function deleteProductImage(path: string): Promise<void> {
  if (!path) return;
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

// ─── LP 画像（公開バケット）────────────────────────────────────────
const LP_BUCKET = "lp-images";

/**
 * LP 用画像を公開バケットにアップロードする。
 * パス: `{userId}/{uuid}.{ext}`
 * @returns Storage 上のファイルパス
 */
export async function uploadLpImage(
  buffer: ArrayBuffer,
  mimeType: string,
  userId: string,
): Promise<string> {
  if (!isAllowedMime(mimeType)) {
    throw new Error("JPG・PNG・WebP のみアップロードできます。");
  }
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("ファイルサイズは 5MB 以内にしてください。");
  }

  const ext = extFromMime(mimeType as AllowedMime);
  const path = `${userId}/${randomUUID()}.${ext}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(LP_BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }
  return path;
}

/**
 * LP 画像の永続的な公開 URL を返す（公開バケットのため期限なし）。
 */
export function getLpImagePublicUrl(path: string): string {
  const supabase = createAdminClient();
  const { data } = supabase.storage.from(LP_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
