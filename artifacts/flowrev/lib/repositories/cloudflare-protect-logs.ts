import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CloudflareProtectLog {
  id: string;
  executedAt: string;
  executedBy: string | null;
  total: number;
  updated: number;
  failed: number;
  errorDetails: string[] | null;
}

/** 最新の一括保護ログを1件返す */
export async function getLatestProtectLog(): Promise<CloudflareProtectLog | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cloudflare_protect_logs")
    .select("id, executed_at, executed_by, total, updated, failed, error_details")
    .order("executed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`保護ログの取得に失敗: ${error.message}`);
  if (!data) return null;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    executedAt: row.executed_at as string,
    executedBy: (row.executed_by as string) ?? null,
    total: (row.total as number) ?? 0,
    updated: (row.updated as number) ?? 0,
    failed: (row.failed as number) ?? 0,
    errorDetails: (row.error_details as string[] | null) ?? null,
  };
}

/** 一括保護の実行結果をログに保存する */
export async function insertProtectLog(params: {
  executedBy: string;
  total: number;
  updated: number;
  failed: number;
  errorDetails?: string[];
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("cloudflare_protect_logs").insert({
    executed_by: params.executedBy,
    total: params.total,
    updated: params.updated,
    failed: params.failed,
    error_details:
      params.errorDetails && params.errorDetails.length > 0
        ? params.errorDetails
        : null,
  });
  if (error) throw new Error(`保護ログの保存に失敗: ${error.message}`);
}
