import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, buildProductPrompt } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  let name = "";
  let category = "";
  try {
    const body = await req.json();
    name = String(body.name ?? "").trim();
    category = String(body.category ?? "").trim();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json(
      { error: "商品名を入力してから生成してください。" },
      { status: 400 },
    );
  }

  try {
    const text = await generateText(buildProductPrompt(name, category));
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
