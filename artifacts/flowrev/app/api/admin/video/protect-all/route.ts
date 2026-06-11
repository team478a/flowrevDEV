import { NextResponse } from "next/server";
import { getSessionProfile } from "@/features/auth/session";
import { getCloudflareSettingsResolved } from "@/lib/repositories/cloudflare-settings";
import { protectAllVideos } from "@/lib/cloudflare/stream";

/**
 * POST /api/admin/video/protect-all
 * Cloudflare Stream の全動画に requireSignedURLs: true を一括適用する。
 * system_admin のみ利用可能。
 * Response: { total, updated, failed, errors }
 */
export async function POST() {
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

  try {
    const result = await protectAllVideos(settings.accountId, settings.apiToken);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "一括保護に失敗しました。" },
      { status: 502 },
    );
  }
}
