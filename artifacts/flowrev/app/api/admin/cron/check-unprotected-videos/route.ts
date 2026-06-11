import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCloudflareSettingsResolved } from "@/lib/repositories/cloudflare-settings";
import { countUnprotectedVideos } from "@/lib/cloudflare/stream";
import { sendUnprotectedAlert } from "@/lib/email/send-unprotected-alert";

/**
 * GET /api/admin/cron/check-unprotected-videos  ← Vercel Cron はこちらを呼ぶ
 * POST /api/admin/cron/check-unprotected-videos ← 外部スケジューラ / 手動テスト用
 *
 * requireSignedURLs: false の動画が 1 件以上あれば system_admin に通知メールを送る。
 *
 * 認証: Authorization: Bearer <CRON_SECRET> ヘッダーで検証。
 * 未設定の場合は認証なし（開発時のみ許容）。
 *
 * Response: { ok: boolean; unprotected: number; total: number; notified: boolean; message?: string }
 */
export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const settings = await getCloudflareSettingsResolved().catch(() => null);
  if (!settings) {
    return NextResponse.json(
      {
        ok: false,
        message: "Cloudflare Stream が設定されていません。チェックをスキップします。",
      },
      { status: 200 },
    );
  }

  let countResult: { unprotected: number; total: number };
  try {
    countResult = await countUnprotectedVideos(
      settings.accountId,
      settings.apiToken,
    );
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "動画カウントに失敗しました。",
      },
      { status: 502 },
    );
  }

  if (countResult.unprotected === 0) {
    return NextResponse.json({
      ok: true,
      unprotected: 0,
      total: countResult.total,
      notified: false,
      message: "未保護動画はありません。",
    });
  }

  const adminEmails = await getSystemAdminEmails().catch(() => []);

  if (adminEmails.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        unprotected: countResult.unprotected,
        total: countResult.total,
        notified: false,
        message:
          "未保護動画が検出されましたが、system_admin のメールアドレスが見つかりませんでした。",
      },
      { status: 500 },
    );
  }

  const checkedAt = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    await sendUnprotectedAlert({
      toEmails: adminEmails,
      unprotectedCount: countResult.unprotected,
      totalCount: countResult.total,
      checkedAt,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        unprotected: countResult.unprotected,
        total: countResult.total,
        notified: false,
        message: e instanceof Error ? e.message : "メール送信に失敗しました。",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    unprotected: countResult.unprotected,
    total: countResult.total,
    notified: true,
  });
}

/**
 * user_profiles から role = system_admin のユーザー ID を取得し、
 * auth.users からメールアドレスを引いて返す。
 */
async function getSystemAdminEmails(): Promise<string[]> {
  const admin = createAdminClient();

  const { data: profiles, error: profileError } = await admin
    .from("user_profiles")
    .select("id")
    .eq("role", "system_admin");

  if (profileError || !profiles || profiles.length === 0) return [];

  const emails: string[] = [];
  for (const profile of profiles) {
    const { data: userRes } = await admin.auth.admin.getUserById(
      profile.id as string,
    );
    const email = userRes?.user?.email;
    if (email) emails.push(email);
  }

  return emails;
}
