import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface VideoCheckLog {
  id: string;
  checkedAt: string;
  unprotected: number;
  total: number;
  notified: boolean;
}

export interface VideoCheckLogsPage {
  logs: VideoCheckLog[];
  total: number;
  page: number;
  pageSize: number;
}

/** cron チェック結果を1件保存する */
export async function insertVideoCheckLog(params: {
  unprotected: number;
  total: number;
  notified: boolean;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("video_check_logs").insert({
    unprotected: params.unprotected,
    total: params.total,
    notified: params.notified,
  });
  if (error) throw new Error(`チェックログの保存に失敗: ${error.message}`);
}

export interface VideoCheckLogChartPoint {
  label: string;
  unprotected: number;
  total: number;
}

/** グラフ表示用に直近 N 件を古い順で返す。limit=0 で全件取得 */
export async function getVideoCheckLogsForChart(
  limit = 30,
): Promise<VideoCheckLogChartPoint[]> {
  const admin = createAdminClient();

  let query = admin
    .from("video_check_logs")
    .select("checked_at, unprotected, total")
    .order("checked_at", { ascending: false });

  if (limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw new Error(`チャートデータの取得に失敗: ${error.message}`);

  const rows = ((data ?? []) as Record<string, unknown>[]).reverse();
  return rows.map((row) => {
    const date = new Date(row.checked_at as string);
    const label = date.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      label,
      unprotected: (row.unprotected as number) ?? 0,
      total: (row.total as number) ?? 0,
    };
  });
}

/** ページネーション付きでチェックログを返す（新しい順） */
export async function getVideoCheckLogsPage(
  page = 1,
  pageSize = 20,
): Promise<VideoCheckLogsPage> {
  const admin = createAdminClient();
  const offset = (page - 1) * pageSize;

  const { data, error, count } = await admin
    .from("video_check_logs")
    .select("id, checked_at, unprotected, total, notified", { count: "exact" })
    .order("checked_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw new Error(`チェックログの取得に失敗: ${error.message}`);

  const rows = (data ?? []) as Record<string, unknown>[];
  const logs: VideoCheckLog[] = rows.map((row) => ({
    id: row.id as string,
    checkedAt: row.checked_at as string,
    unprotected: (row.unprotected as number) ?? 0,
    total: (row.total as number) ?? 0,
    notified: (row.notified as boolean) ?? false,
  }));

  return { logs, total: count ?? 0, page, pageSize };
}
