import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateLpHtml } from "@/lib/ai/client";
import { generateLpCss, buildDesignedLpPrompt, type LpColorConfig } from "@/lib/ai/lp-design-system";

const REFERENCE_MAX_CHARS = 3000;
const FETCH_TIMEOUT_MS = 8000;

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s{2,}/g, " ")
    .trim();
}

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
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html")) return null;
    const html = await res.text();
    return extractTextFromHtml(html).slice(0, REFERENCE_MAX_CHARS);
  } catch {
    return null;
  }
}

/** AI が出力するコードブロックマーカーを除去する */
function stripCodeFence(text: string): string {
  return text
    .replace(/^```[\w]*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  let title = "";
  let productName = "";
  let referenceUrl = "";
  let designStyleName = "モダン";
  let colorPrimary = "#2563eb";
  let colorBg = "#eff6ff";
  let colorAccent = "#1d4ed8";

  try {
    const body = await req.json();
    title = String(body.title ?? "").trim();
    productName = String(body.productName ?? "").trim();
    referenceUrl = String(body.referenceUrl ?? "").trim();
    if (body.designStyleName) designStyleName = String(body.designStyleName).trim();
    if (body.colorPrimary) colorPrimary = String(body.colorPrimary).trim();
    if (body.colorBg) colorBg = String(body.colorBg).trim();
    if (body.colorAccent) colorAccent = String(body.colorAccent).trim();
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
        referenceWarning = "参考URLからテキストを取得できませんでした。通常の生成で続行します。";
      }
    } catch {
      referenceWarning = "参考URLの形式が正しくありません。通常の生成で続行します。";
    }
  }

  const color: LpColorConfig = { primary: colorPrimary, bg: colorBg, accent: colorAccent };
  const css = generateLpCss(color, designStyleName);
  const prompt = buildDesignedLpPrompt(title, productName, designStyleName, referenceContent);

  try {
    const rawHtml = await generateLpHtml(prompt);
    const bodyHtml = stripCodeFence(rawHtml);
    // CSS をサーバー側で結合して返す
    const text = `<style>${css}</style>\n${bodyHtml}`;
    return NextResponse.json({ text, referenceWarning });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
