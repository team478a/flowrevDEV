import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt, decrypt } from "@/lib/crypto";

export interface CloudflareSettingsMasked {
  accountId: string | null;
  hasApiToken: boolean;
}

export interface CloudflareSettingsResolved {
  accountId: string;
  apiToken: string;
}

export interface UpsertCloudflareSettingsInput {
  accountId?: string;
  apiToken?: string;
}

/** 管理画面用：API トークンをマスクして返す */
export async function getCloudflareSettingsMasked(): Promise<CloudflareSettingsMasked | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cloudflare_settings")
    .select("account_id, api_token_enc")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Cloudflare設定の取得に失敗: ${error.message}`);
  if (!data) return null;

  const row = data as Record<string, unknown>;
  return {
    accountId: (row.account_id as string) ?? null,
    hasApiToken: !!(row.api_token_enc as string),
  };
}

/** 動画アップロード API 用：復号済み設定を返す */
export async function getCloudflareSettingsResolved(): Promise<CloudflareSettingsResolved | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cloudflare_settings")
    .select("account_id, api_token_enc")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Cloudflare設定の取得に失敗: ${error.message}`);
  if (!data) return null;

  const row = data as Record<string, unknown>;
  if (!row.account_id || !row.api_token_enc) return null;

  return {
    accountId: row.account_id as string,
    apiToken: decrypt(row.api_token_enc as string),
  };
}

/** Cloudflare 設定を upsert する（最大 1 行） */
export async function upsertCloudflareSettings(
  input: UpsertCloudflareSettingsInput,
): Promise<void> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("cloudflare_settings")
    .select("id, account_id, api_token_enc")
    .limit(1)
    .maybeSingle();

  const existingRow = existing as Record<string, unknown> | null;
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.accountId !== undefined) {
    payload.account_id = input.accountId || null;
  } else if (existingRow?.account_id) {
    payload.account_id = existingRow.account_id;
  }

  if (input.apiToken) {
    payload.api_token_enc = encrypt(input.apiToken);
  } else if (existingRow?.api_token_enc) {
    payload.api_token_enc = existingRow.api_token_enc;
  }

  if (existingRow) {
    const { error } = await admin
      .from("cloudflare_settings")
      .update(payload)
      .eq("id", existingRow.id as string);
    if (error) throw new Error(`Cloudflare設定の更新に失敗: ${error.message}`);
  } else {
    const { error } = await admin.from("cloudflare_settings").insert(payload);
    if (error) throw new Error(`Cloudflare設定の作成に失敗: ${error.message}`);
  }
}
