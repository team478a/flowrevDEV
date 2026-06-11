import "server-only";

const CF_STREAM_BASE = "https://api.cloudflare.com/client/v4/accounts";

/**
 * Cloudflare Stream の署名付きトークンを生成する。
 * 動画に requiresignedurls が設定されている場合、このトークンを iframe src に使う。
 * @param accountId  Cloudflare Account ID
 * @param apiToken   Cloudflare API Token（Stream:Read 権限が必要）
 * @param videoId    Cloudflare Stream の Video ID
 * @param expiresIn  有効期限（秒）。デフォルト 3600（1時間）
 * @returns 署名済み JWT トークン文字列
 */
export async function getStreamSignedToken(
  accountId: string,
  apiToken: string,
  videoId: string,
  expiresIn = 3600,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const url = `${CF_STREAM_BASE}/${accountId}/stream/${videoId}/token`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ exp }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Cloudflare Stream トークン生成失敗 (${res.status}): ${body}`,
    );
  }

  const json = (await res.json()) as { result?: { token?: string } };
  const token = json.result?.token;
  if (!token) {
    throw new Error("Cloudflare Stream からトークンを取得できませんでした。");
  }
  return token;
}
