import "server-only";
import { Resend } from "resend";
import { getActiveEmailSetting } from "@/lib/repositories/email-settings";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * シナリオステップのメールを Resend で送信する。
 * メール設定は WL → HQ のフォールバック順で解決する。
 */
export async function sendScenarioStepEmail(params: {
  toEmail: string;
  subject: string | null;
  body: string;
  whiteLabelId: string;
  brandName?: string;
}): Promise<void> {
  const setting = await getActiveEmailSetting(params.whiteLabelId);
  if (!setting) {
    throw new Error(
      "メール設定が未登録です。管理画面でメール設定（Resend）を登録してください。",
    );
  }
  if (!setting.fromEmail) {
    throw new Error(
      "送信元メールアドレスが未設定です。メール設定を確認してください。",
    );
  }

  const brand = params.brandName?.trim() || "FlowRev";
  const subject =
    params.subject?.trim() || `【${brand}】からのお知らせ`;
  const from = setting.fromName
    ? `${setting.fromName} <${setting.fromEmail}>`
    : setting.fromEmail;

  const bodyHtml = `<!doctype html>
<html lang="ja">
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr><td style="padding:28px 32px;">
          <p style="margin:0;font-size:14px;line-height:1.8;color:#3f3f46;white-space:pre-wrap">${escapeHtml(params.body)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = new Resend(setting.apiKey);
  const { error } = await resend.emails.send({
    from,
    to: params.toEmail,
    subject,
    text: params.body,
    html: bodyHtml,
  });

  if (error) {
    throw new Error(`メール送信に失敗しました: ${error.message}`);
  }
}
