import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const INACTIVE_THRESHOLD_DAYS = 7;

function isInactive(lastActionAt: string | null): boolean {
  if (!lastActionAt) return true; // 未接触も未アクションとして扱う
  const diffMs = Date.now() - new Date(lastActionAt).getTime();
  return diffMs > INACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

function escapeCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

function sourceLabel(source: string): string {
  if (source === "lp") return "LPから";
  if (source === "import") return "インポート";
  return "手動登録";
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const inactiveOnly = req.nextUrl.searchParams.get("inactive") === "1";

  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, email, name, status, tags, source, last_action_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "顧客データの取得に失敗しました。" },
      { status: 500 },
    );
  }

  type Row = {
    email: string;
    name: string | null;
    status: string;
    tags: string[];
    source: string;
    last_action_at: string | null;
    created_at: string;
  };

  let rows = (data ?? []) as Row[];
  if (inactiveOnly) {
    rows = rows.filter((r) => isInactive(r.last_action_at));
  }

  const header = ["氏名", "メール", "ステータス", "タグ", "最終アクション日", "登録日", "登録元"];
  const lines: string[] = [header.map(escapeCell).join(",")];

  for (const r of rows) {
    const cells = [
      r.name ?? "",
      r.email,
      r.status === "active" ? "アクティブ" : "無効",
      (r.tags ?? []).join("|"),
      formatDate(r.last_action_at),
      formatDate(r.created_at),
      sourceLabel(r.source),
    ];
    lines.push(cells.map(escapeCell).join(","));
  }

  const csv = "\uFEFF" + lines.join("\r\n"); // BOM 付き UTF-8（Excel 対応）
  const filename = inactiveOnly
    ? `customers_inactive_${new Date().toISOString().slice(0, 10)}.csv`
    : `customers_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
