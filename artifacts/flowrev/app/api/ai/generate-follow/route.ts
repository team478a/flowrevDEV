import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, buildFollowPrompt } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  let subject = "";
  let scenarioName = "";
  try {
    const body = await req.json();
    subject = String(body.subject ?? "").trim();
    scenarioName = String(body.scenarioName ?? "").trim();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  try {
    const text = await generateText(buildFollowPrompt(subject, scenarioName));
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
