import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

/**
 * Cloudflare Stream Webhook エンドポイント
 *
 * Cloudflare は動画のトランスコード完了（または失敗）時にこのエンドポイントへ
 * POST リクエストを送信する。ペイロードの uid（動画ID）を使って
 * lessons.cloudflare_video_status を更新する。
 *
 * Webhook シークレット検証:
 *   Header: Webhook-Signature: ts=<timestamp>,v1=<hmac-sha256-hex>
 *   HMAC-SHA256( key=CLOUDFLARE_STREAM_WEBHOOK_SECRET, msg="<timestamp>.<body>" )
 *
 * 設定方法:
 *   Cloudflare Dashboard → Stream → Webhooks でエンドポイント URL と
 *   シークレットを登録し、発行されたシークレットを
 *   CLOUDFLARE_STREAM_WEBHOOK_SECRET 環境変数に設定する。
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const webhookSecret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (!webhookSecret) {
    if (isProd) {
      console.error("[CF Stream Webhook] CLOUDFLARE_STREAM_WEBHOOK_SECRET が未設定です（本番環境）。");
      return NextResponse.json(
        { error: "Webhook シークレットが未設定のため受信を拒否しました。" },
        { status: 401 },
      );
    }
    console.warn("[CF Stream Webhook] CLOUDFLARE_STREAM_WEBHOOK_SECRET 未設定: 署名検証をスキップします（開発環境のみ許容）。");
  } else {
    const sigHeader = req.headers.get("webhook-signature") ?? "";
    if (!verifySignature(rawBody, sigHeader, webhookSecret)) {
      return NextResponse.json({ error: "署名検証に失敗しました。" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "不正なJSONです。" }, { status: 400 });
  }

  const videoId = payload.uid as string | undefined;
  if (!videoId) {
    return NextResponse.json({ error: "uid が見つかりません。" }, { status: 400 });
  }

  const statusObj = payload.status as Record<string, unknown> | undefined;
  const state = statusObj?.state as string | undefined;
  const readyToStream = payload.readyToStream as boolean | undefined;

  const videoStatus = resolveStatus(state, readyToStream);

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("lessons")
      .update({
        cloudflare_video_status: videoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("cloudflare_video_id", videoId);

    if (error) {
      console.error("[CF Stream Webhook] DB更新エラー:", error.message);
      return NextResponse.json({ error: "DB更新に失敗しました。" }, { status: 500 });
    }
  } catch (e) {
    console.error("[CF Stream Webhook] 予期しないエラー:", e);
    return NextResponse.json({ error: "内部エラー" }, { status: 500 });
  }

  return NextResponse.json({ received: true, videoId, status: videoStatus });
}

/**
 * Cloudflare の Webhook シグネチャを検証する。
 * Header 形式: ts=<timestamp>,v1=<hex>
 * 検証メッセージ: "<timestamp>.<rawBody>"
 */
function verifySignature(
  rawBody: string,
  sigHeader: string,
  secret: string,
): boolean {
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => p.split("=") as [string, string]),
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) return false;

  const msg = `${ts}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(msg).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(v1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/**
 * Cloudflare のステータス文字列を FlowRev 内部の値にマップする。
 * - "ready" → "ready"
 * - "error" → "error"
 * - その他（"queued", "inprogress", "pendingupload" 等） → "pending"
 */
function resolveStatus(
  state: string | undefined,
  readyToStream: boolean | undefined,
): string {
  if (readyToStream === true || state === "ready") return "ready";
  if (state === "error") return "error";
  return "pending";
}
