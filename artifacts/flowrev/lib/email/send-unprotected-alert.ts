import "server-only";
import { Resend } from "resend";
import { getActiveEmailSetting } from "@/lib/repositories/email-settings";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface SendUnprotectedAlertInput {
  toEmails: string[];
  unprotectedCount: number;
  totalCount: number;
  checkedAt: string;
}

/**
 * 未保護動画が検出されたことを system_admin に通知するメールを送信する。
 * HQ 共通メール設定（Resend）を使用する。
 */
export async function sendUnprotectedAlert(
  input: SendUnprotectedAlertInput,
): Promise<void> {
  if (input.toEmails.length === 0) return;

  const setting = await getActiveEmailSetting(null);
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

  const from = setting.fromName
    ? `${setting.fromName} <${setting.fromEmail}>`
    : setting.fromEmail;

  const subject = `【FlowRev】未保護動画を検出しました（${input.unprotectedCount} 件）`;

  const bodyText = buildAlertText(input);
  const bodyHtml = buildAlertHtml(input);

  const resend = new Resend(setting.apiKey);
  const { error } = await resend.emails.send({
    from,
    to: input.toEmails,
    subject,
    text: bodyText,
    html: bodyHtml,
  });

  if (error) {
    throw new Error(`メール送信に失敗しました: ${error.message}`);
  }
}

function buildAlertText(input: SendUnprotectedAlertInput): string {
  return [
    "FlowRev 自動チェック通知",
    "",
    `チェック日時: ${input.checkedAt}`,
    `総動画数: ${input.totalCount} 件`,
    `未保護動画数: ${input.unprotectedCount} 件`,
    "",
    "requireSignedURLs が false の動画が検出されました。",
    "管理画面（動画設定 → 一括保護）から保護処理を実行してください。",
    "",
    "このメールは FlowRev のスケジュールバッチが自動送信しています。",
  ].join("\n");
}

function buildAlertHtml(input: SendUnprotectedAlertInput): string {
  return `<!doctype html>
<html lang="ja">
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr>
          <td style="background:#dc2626;padding:16px 32px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">
              ⚠️ 未保護動画を検出しました
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:20px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#dc2626;">
                    ${escapeHtml(String(input.unprotectedCount))} 件
                  </p>
                  <p style="margin:0;font-size:13px;color:#7f1d1d;">
                    総動画数 ${escapeHtml(String(input.totalCount))} 件中、未保護の動画が検出されました。
                  </p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="border-top:1px solid #e4e4e7;margin-bottom:20px;">
              <tr>
                <td style="padding:12px 0;font-size:13px;color:#71717a;">
                  チェック日時
                </td>
                <td style="padding:12px 0;font-size:13px;color:#18181b;text-align:right;">
                  ${escapeHtml(input.checkedAt)}
                </td>
              </tr>
            </table>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#3f3f46;">
              <code style="font-family:monospace;background:#f4f4f5;padding:2px 6px;border-radius:4px;">requireSignedURLs</code>
              が無効の動画が残っています。<br>
              管理画面の <strong>動画設定 → 一括保護</strong> から保護処理を実行してください。
            </p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
              このメールは FlowRev のスケジュールバッチが自動送信しています。
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
