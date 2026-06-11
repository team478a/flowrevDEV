import { NextResponse } from "next/server";
import { getSessionProfile } from "@/features/auth/session";
import { getCloudflareSettingsResolved } from "@/lib/repositories/cloudflare-settings";
import { countUnprotectedVideos } from "@/lib/cloudflare/stream";

/**
 * GET /api/admin/video/unprotected-count
 * requireSignedURLs: false の動画数を返す。
 * system_admin のみ利用可能。
 * Response: { unprotected: number; total: number }
 */
export async function GET() {
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
      { error: "Cloudflare Stream が設定されていません。" },
      { status: 503 },
    );
  }

  try {
    const result = await countUnprotectedVideos(
      settings.accountId,
      settings.apiToken,
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "未保護動画の取得に失敗しました。",
      },
      { status: 502 },
    );
  }
}
