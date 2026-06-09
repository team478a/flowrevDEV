import "server-only";
import { Resend } from "resend";
import { getActiveEmailSetting } from "@/lib/repositories/email-settings";

export interface SendInvitationEmailInput {
  whiteLabelId: string | null;
  toEmail: string;
  clientName: string;
  inviteUrl: string;
  brandName?: string;
}

/**
 * 招待メールを送信する（Resend）。
 * 設定（APIキー・送信元）は DB から WL→HQ の順で解決し復号して使う。
 * 有効な設定が無い、または送信に失敗した場合は例外を投げる。
 */
export async function sendInvitationEmail(
  input: SendInvitationEmailInput,
): Promise<void> {
  const setting = await getActiveEmailSetting(input.whiteLabelId);
  if (!setting) {
    throw new Error(
      "メール設定が未登録です。管理画面でメール設定（Resend）を登録してください。",
    );
  }
  if (!setting.fromEmail) {
    throw new Error("送信元メールアドレスが未設定です。メール設定を確認してください。");
  }

  const brand = input.brandName?.trim() || "FlowRev";
  const from = setting.fromName
    ? `${setting.fromName} <${setting.fromEmail}>`
    : setting.fromEmail;

  const resend = new Resend(setting.apiKey);
  const { error } = await resend.emails.send({
    from,
    to: input.toEmail,
    subject: `【${brand}】アカウント登録のご案内`,
    html: buildInviteHtml({
      brand,
      clientName: input.clientName,
      inviteUrl: input.inviteUrl,
    }),
    text: buildInviteText({
      brand,
      clientName: input.clientName,
      inviteUrl: input.inviteUrl,
    }),
  });

  if (error) {
    throw new Error(`メール送信に失敗しました: ${error.message}`);
  }
}

function buildInviteText(p: {
  brand: string;
  clientName: string;
  inviteUrl: string;
}): string {
  return [
    `${p.clientName} 御中`,
    "",
    `${p.brand} へのアカウント登録のご案内です。`,
    "下記のURLから7日以内に登録を完了してください。",
    "",
    p.inviteUrl,
    "",
    "※このメールに心当たりがない場合は破棄してください。",
  ].join("\n");
}

function buildInviteHtml(p: {
  brand: string;
  clientName: string;
  inviteUrl: string;
}): string {
  return `<!doctype html>
<html lang="ja">
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr><td style="padding:28px 32px;">
          <h1 style="margin:0 0 8px;font-size:18px;">${escapeHtml(p.brand)} へようこそ</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#3f3f46;">
            ${escapeHtml(p.clientName)} 御中<br>
            アカウント登録のご案内です。下記ボタンから7日以内に登録を完了してください。
          </p>
          <p style="margin:0 0 24px;">
            <a href="${escapeAttr(p.inviteUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">登録を完了する</a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;word-break:break-all;">
            ボタンが開けない場合は次のURLをブラウザに貼り付けてください：<br>${escapeHtml(p.inviteUrl)}
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#a1a1aa;">心当たりがない場合はこのメールを破棄してください。</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
