import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const bodySchema = z.object({
  lpId: z.string().uuid(),
  email: z.string().email("有効なメールアドレスを入力してください。"),
  name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "入力が不正です。";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { lpId, email, name, phone } = parsed.data;
  const admin = createAdminClient();

  // LP を取得（clientId / whiteLabelId を取得するため）
  const { data: lpData } = await admin
    .from("landing_pages")
    .select("id, client_id, white_label_id, conversions, status")
    .eq("id", lpId)
    .eq("status", "published")
    .maybeSingle();

  if (!lpData) {
    return NextResponse.json({ error: "LPが見つかりません。" }, { status: 404 });
  }

  const lp = lpData as Record<string, unknown>;
  const clientId = lp.client_id as string;
  const whiteLabelId = lp.white_label_id as string;
  const currentConversions = (lp.conversions as number) ?? 0;

  // 顧客を upsert（email + client_id が既存の場合は何もしない）
  const { error: customerError } = await admin
    .from("customers")
    .upsert(
      {
        email,
        name: name ?? null,
        phone: phone ?? null,
        client_id: clientId,
        white_label_id: whiteLabelId,
        source: "lp",
        status: "active",
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email,client_id", ignoreDuplicates: true },
    );

  if (customerError) {
    return NextResponse.json(
      { error: "登録に失敗しました。しばらくしてからお試しください。" },
      { status: 500 },
    );
  }

  // コンバージョンカウントを +1
  await admin
    .from("landing_pages")
    .update({
      conversions: currentConversions + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lpId);

  return NextResponse.json({ ok: true });
}
