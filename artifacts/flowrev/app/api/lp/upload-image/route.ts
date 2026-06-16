import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadLpImage, getLpImagePublicUrl } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("image");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: "フォームデータの解析に失敗しました。" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "画像ファイルを選択してください。" }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const path = await uploadLpImage(buffer, file.type, user.id);
    const url = getLpImagePublicUrl(path);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "アップロードに失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
