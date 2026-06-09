import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, buildLpPrompt } from "@/lib/ai/client";

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
  try {
    const body = await req.json();
    title = String(body.title ?? "").trim();
    productName = String(body.productName ?? "").trim();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json(
      { error: "ページタイトルを入力してから生成してください。" },
      { status: 400 },
    );
  }

  try {
    const text = await generateText(buildLpPrompt(title, productName));
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
