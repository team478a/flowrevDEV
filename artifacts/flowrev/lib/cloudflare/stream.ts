import "server-only";

const CF_STREAM_BASE = "https://api.cloudflare.com/client/v4/accounts";

export interface ProtectAllVideosResult {
  total: number;
  updated: number;
  failed: number;
  errors: string[];
}

/**
 * Cloudflare Stream の全動画に requireSignedURLs: true を一括設定する。
 * すでに設定済みの動画もパッチを送るが冪等なので安全。
 * ページネーションで全件取得し順次更新する。
 */
export async function protectAllVideos(
  accountId: string,
  apiToken: string,
): Promise<ProtectAllVideosResult> {
  const result: ProtectAllVideosResult = {
    total: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  const videoIds: string[] = [];
  let cursor: string | null = null;

  while (true) {
    const listUrl = new URL(
      `${CF_STREAM_BASE}/${accountId}/stream`,
    );
    if (cursor) listUrl.searchParams.set("after", cursor);

    const listRes = await fetch(listUrl.toString(), {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!listRes.ok) {
      const body = await listRes.text().catch(() => "");
      throw new Error(
        `動画一覧の取得に失敗しました (${listRes.status}): ${body}`,
      );
    }

    const json = (await listRes.json()) as {
      result?: Array<{ uid?: string }>;
      result_info?: { next_cursor?: string };
    };

    const videos = json.result ?? [];
    for (const v of videos) {
      if (v.uid) videoIds.push(v.uid);
    }

    const nextCursor = json.result_info?.next_cursor;
    if (!nextCursor || videos.length === 0) break;
    cursor = nextCursor;
  }

  result.total = videoIds.length;

  for (const videoId of videoIds) {
    const patchUrl = `${CF_STREAM_BASE}/${accountId}/stream/${videoId}`;
    try {
      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requireSignedURLs: true }),
        cache: "no-store",
      });

      if (!patchRes.ok) {
        const body = await patchRes.text().catch(() => "");
        result.failed++;
        result.errors.push(`${videoId}: (${patchRes.status}) ${body}`);
      } else {
        result.updated++;
      }
    } catch (e) {
      result.failed++;
      result.errors.push(
        `${videoId}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  return result;
}

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
