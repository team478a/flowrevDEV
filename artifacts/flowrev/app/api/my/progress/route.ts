import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getCustomerIdByUserId,
  upsertLessonComplete,
} from "@/lib/repositories/progress";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  let lessonId = "";
  let courseId = "";
  try {
    const body = await req.json();
    lessonId = String(body.lessonId ?? "").trim();
    courseId = String(body.courseId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  if (!lessonId || !courseId) {
    return NextResponse.json(
      { error: "lessonId と courseId は必須です。" },
      { status: 400 },
    );
  }

  const customerId = await getCustomerIdByUserId(user.id);
  if (!customerId) {
    return NextResponse.json(
      { error: "顧客情報が見つかりません。" },
      { status: 404 },
    );
  }

  // whiteLabelId をコースから取得する
  const admin = createAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("white_label_id")
    .eq("id", courseId)
    .maybeSingle();

  const whiteLabelId =
    ((course as Record<string, unknown> | null)?.white_label_id as string) ?? "";

  try {
    await upsertLessonComplete(customerId, lessonId, courseId, whiteLabelId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "更新に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
