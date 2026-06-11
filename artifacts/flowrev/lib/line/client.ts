import "server-only";

const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

/**
 * LINE Messaging API でテキストメッセージを push 送信する。
 * @param channelAccessToken - LINE チャネルアクセストークン
 * @param lineUserId - 送信先の LINE ユーザー ID（Uxxxxxxxx...形式）
 * @param message - 送信するテキスト（最大5000文字）
 */
export async function sendLinePushMessage(
  channelAccessToken: string,
  lineUserId: string,
  message: string,
): Promise<void> {
  const res = await fetch(LINE_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: "text", text: message.slice(0, 5000) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LINE API エラー (${res.status}): ${body}`);
  }
}
