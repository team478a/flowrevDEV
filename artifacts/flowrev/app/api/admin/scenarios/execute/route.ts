import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  listPendingDueLogs,
  markLogSent,
  markLogFailed,
} from "@/lib/repositories/scenario-execution";
import { sendScenarioStepEmail } from "@/lib/email/send-scenario-step";

/**
 * POST /api/admin/scenarios/execute[?force=true]
 * シナリオの pending ログを処理してメールを送信する。
 * force=true のとき delay_days を無視して即時実行（テスト用）。
 * 認証済みユーザーのみ実行可能。
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const force = req.nextUrl.searchParams.get("force") === "true";

  let logs: Awaited<ReturnType<typeof listPendingDueLogs>>;
  try {
    logs = await listPendingDueLogs(force);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ログ取得に失敗しました。";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (logs.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      failed: 0,
      message: force
        ? "実行対象の pending ログがありません。"
        : "送信期日に達した pending ログがありません。",
    });
  }

  const admin = createAdminClient();
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const log of logs) {
    try {
      const { data: customer } = await admin
        .from("customers")
        .select("email, name")
        .eq("id", log.customerId)
        .maybeSingle();

      if (!customer) {
        await markLogFailed(log.logId, "顧客が見つかりません。");
        failed++;
        continue;
      }

      const c = customer as Record<string, unknown>;
      await sendScenarioStepEmail({
        toEmail: c.email as string,
        subject: log.subject,
        body: log.body,
        whiteLabelId: log.whiteLabelId,
      });

      await markLogSent(log.logId);
      sent++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "不明なエラー";
      await markLogFailed(log.logId, msg);
      errors.push(msg);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, errors });
}
