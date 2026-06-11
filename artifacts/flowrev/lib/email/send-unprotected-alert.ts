import "server-only";
import { Resend } from "resend";
import { getActiveEmailSetting } from "@/lib/repositories/email-settings";
import type { UnprotectedVideoItem } from "@/lib/cloudflare/stream";

const MAX_LIST_DISPLAY = 10;

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
  videos: UnprotectedVideoItem[];
  appUrl?: string;
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

function buildVideoListText(videos: UnprotectedVideoItem[]): string {
  if (videos.length === 0) return "";
  const shown = videos.slice(0, MAX_LIST_DISPLAY);
  const remaining = videos.length - shown.length;
  const lines = shown.map(
    (v, i) => `  ${i + 1}. ${v.title}（ID: ${v.id}）`,
  );
  if (remaining > 0) {
    lines.push(`  … 他 ${remaining} 件`);
  }
  return ["", "【未保護動画一覧】", ...lines].join("\n");
}

function buildAlertText(input: SendUnprotectedAlertInput): string {
  const adminUrl = input.appUrl
    ? `${input.appUrl.replace(/\/$/, "")}/admin/settings/cloudflare`
    : null;

  return [
    "FlowRev 自動チェック通知",
    "",
    `チェック日時: ${input.checkedAt}`,
    `総動画数: ${input.totalCount} 件`,
    `未保護動画数: ${input.unprotectedCount} 件`,
    buildVideoListText(input.videos),
    "",
    "requireSignedURLs が false の動画が検出されました。",
    "管理画面（動画設定 → 一括保護）から保護処理を実行してください。",
    adminUrl ? `\n▶ 一括保護ページを開く:\n${adminUrl}` : "",
    "",
    "このメールは FlowRev のスケジュールバッチが自動送信しています。",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function buildVideoListHtml(videos: UnprotectedVideoItem[]): string {
  if (videos.length === 0) return "";
  const shown = videos.slice(0, MAX_LIST_DISPLAY);
  const remaining = videos.length - shown.length;

  const rows = shown
    .map(
      (v, i) => `
              <tr style="border-bottom:1px solid #f4f4f5;">
                <td style="padding:8px 12px;font-size:12px;color:#71717a;white-space:nowrap;">
                  ${i + 1}
                </td>
                <td style="padding:8px 12px;font-size:13px;color:#18181b;">
                  ${escapeHtml(v.title)}
                </td>
                <td style="padding:8px 12px;font-size:11px;color:#a1a1aa;font-family:monospace;white-space:nowrap;">
                  ${escapeHtml(v.id)}
                </td>
              </tr>`,
    )
    .join("");

  const remainingRow =
    remaining > 0
      ? `<tr>
                <td colspan="3" style="padding:8px 12px;font-size:12px;color:#71717a;text-align:center;">
                  … 他 ${remaining} 件
                </td>
              </tr>`
      : "";

  return `
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#3f3f46;">
              未保護動画一覧
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #e4e4e7;border-radius:8px;margin-bottom:20px;overflow:hidden;">
              <thead>
                <tr style="background:#f4f4f5;">
                  <th style="padding:8px 12px;font-size:11px;color:#71717a;text-align:left;font-weight:600;">#</th>
                  <th style="padding:8px 12px;font-size:11px;color:#71717a;text-align:left;font-weight:600;">タイトル</th>
                  <th style="padding:8px 12px;font-size:11px;color:#71717a;text-align:left;font-weight:600;">動画 ID</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                ${remainingRow}
              </tbody>
            </table>`;
}

function buildAdminLinkButtonHtml(appUrl: string | undefined): string {
  if (!appUrl) return "";
  const href = `${appUrl.replace(/\/$/, "")}/admin/settings/cloudflare`;
  return `
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="border-radius:8px;background:#dc2626;">
                  <a href="${escapeHtml(href)}"
                    target="_blank"
                    style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;line-height:1;">
                    ▶ 一括保護ページを開く
                  </a>
                </td>
              </tr>
            </table>`;
}

function buildAlertHtml(input: SendUnprotectedAlertInput): string {
  return `<!doctype html>
<html lang="ja">
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0"
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
            ${buildVideoListHtml(input.videos)}
            <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#3f3f46;">
              <code style="font-family:monospace;background:#f4f4f5;padding:2px 6px;border-radius:4px;">requireSignedURLs</code>
              が無効の動画が残っています。<br>
              下のボタンから管理画面の <strong>動画設定 → 一括保護</strong> を開いて保護処理を実行してください。
            </p>
            ${buildAdminLinkButtonHtml(input.appUrl)}
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
