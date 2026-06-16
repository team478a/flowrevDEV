import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, buildLpPrompt } from "@/lib/ai/client";

const REFERENCE_MAX_CHARS = 3000;
const FETCH_TIMEOUT_MS = 8000;

/** HTML タグ・script・style を除去してプレーンテキストを抽出する */
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** URL を fetch してテキストを抽出する。失敗時は null を返す */
async function fetchReferenceText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FlowRevBot/1.0)" },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const html = await res.text();
    const text = extractTextFromHtml(html);
    return text.slice(0, REFERENCE_MAX_CHARS);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  let title = "";
  let productName = "";
  let referenceUrl = "";
  let designStyleName = "";
  let colorPrimary = "";
  let colorBg = "";
  let colorAccent = "";

  try {
    const body = await req.json();
    title = String(body.title ?? "").trim();
    productName = String(body.productName ?? "").trim();
    referenceUrl = String(body.referenceUrl ?? "").trim();
    designStyleName = String(body.designStyleName ?? "").trim();
    colorPrimary = String(body.colorPrimary ?? "").trim();
    colorBg = String(body.colorBg ?? "").trim();
    colorAccent = String(body.colorAccent ?? "").trim();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json(
      { error: "ページタイトルを入力してから生成してください。" },
      { status: 400 },
    );
  }

  let referenceContent: string | undefined;
  let referenceWarning: string | undefined;

  if (referenceUrl) {
    try {
      new URL(referenceUrl);
      const text = await fetchReferenceText(referenceUrl);
      if (text && text.length > 50) {
        referenceContent = text;
      } else {
        referenceWarning =
          "参考URLからテキストを取得できませんでした。通常の生成で続行します。";
      }
    } catch {
      referenceWarning = "参考URLの形式が正しくありません。通常の生成で続行します。";
    }
  }

  const design =
    colorPrimary
      ? {
          styleName: designStyleName || undefined,
          primary: colorPrimary,
          bg: colorBg || undefined,
          accent: colorAccent || undefined,
        }
      : undefined;

  try {
    const text = await generateText(
      buildLpPrompt(title, productName, referenceContent, design),
    );
    return NextResponse.json({ text, referenceWarning });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
