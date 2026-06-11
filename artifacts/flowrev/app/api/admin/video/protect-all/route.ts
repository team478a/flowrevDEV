import { NextRequest, NextResponse } from "next/server";
import { getSessionProfile } from "@/features/auth/session";
import { getCloudflareSettingsResolved } from "@/lib/repositories/cloudflare-settings";
import { protectAllVideos, protectVideosByIds } from "@/lib/cloudflare/stream";
import { insertProtectLog } from "@/lib/repositories/cloudflare-protect-logs";

/**
 * POST /api/admin/video/protect-all
 * Cloudflare Stream の全動画（または指定動画）に requireSignedURLs: true を適用する。
 * system_admin のみ利用可能。
 *
 * Body (optional): { videoIds?: string[] }
 *   videoIds が指定された場合はそのIDのみ対象（失敗分の再試行用）。
 *   省略時は全動画が対象。
 *
 * Response: { total, updated, failed, errors, failedIds }
 */
export async function POST(req: NextRequest) {
  const session = await getSessionProfile();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (session.role !== "system_admin") {
    return NextResponse.json(
      { error: "この操作を行う権限がありません。" },
      { status: 403 },
    );
  }

  const settings = await getCloudflareSettingsResolved().catch(() => null);
  if (!settings) {
    return NextResponse.json(
      {
        error:
          "Cloudflare Stream が設定されていません。先に API トークンとアカウント ID を保存してください。",
      },
      { status: 503 },
    );
  }

  let videoIds: string[] | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body?.videoIds) && body.videoIds.length > 0) {
      videoIds = body.videoIds as string[];
    }
  } catch {
    // ボディ解析失敗時は全件モードにフォールバック
  }

  try {
    const result = videoIds
      ? await protectVideosByIds(settings.accountId, settings.apiToken, videoIds)
      : await protectAllVideos(settings.accountId, settings.apiToken);

    await insertProtectLog({
      executedBy: session.userId,
      total: result.total,
      updated: result.updated,
      failed: result.failed,
      errorDetails: result.errors.length > 0 ? result.errors : undefined,
    }).catch(() => {});

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "一括保護に失敗しました。" },
      { status: 502 },
    );
  }
}
