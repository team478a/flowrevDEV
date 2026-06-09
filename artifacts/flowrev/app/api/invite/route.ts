import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/features/auth/session";
import { getInvitationForSend } from "@/lib/repositories/invitations";
import { sendInvitationEmail } from "@/lib/email/send-invite";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  invitationId: z.string().uuid("招待IDが不正です。"),
});

function buildInviteUrl(token: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL が未設定のため招待URLを生成できません。");
  }
  return `${base}/register?token=${token}`;
}

/**
 * 招待メール（再）送信エンドポイント（§12 /api/invite）。
 * white_label_owner のみ。invitationId を受け取り、自テナントの招待に対して送信する。
 */
export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (session?.role !== "white_label_owner" || !session.whiteLabelId) {
    return NextResponse.json(
      { error: "この操作を行う権限がありません。" },
      { status: 403 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト本文が不正です。" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力が不正です。" },
      { status: 400 },
    );
  }

  // RLS 適用のセッションクライアントで取得するため、他テナントの招待は取得できない。
  const invitation = await getInvitationForSend(parsed.data.invitationId);
  if (!invitation) {
    return NextResponse.json(
      { error: "対象の招待が見つからないか、すでに使用済みです。" },
      { status: 404 },
    );
  }

  try {
    await sendInvitationEmail({
      whiteLabelId: invitation.whiteLabelId,
      toEmail: invitation.email,
      clientName: invitation.clientName,
      inviteUrl: buildInviteUrl(invitation.token),
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "招待メールの送信に失敗しました。";
    console.error("[api/invite] email send failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
