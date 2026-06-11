import Link from "next/link";
import { getSessionProfile } from "@/features/auth/session";
import { getCloudflareSettingsMasked } from "@/lib/repositories/cloudflare-settings";
import { getLatestVideoCheckLog } from "@/lib/repositories/video-check-logs";
import { VideoProtectionCard } from "@/features/dashboard/components/video-protection-card";
import { createAdminClient } from "@/lib/supabase/admin";
import { CustomerTrendChart } from "@/features/dashboard/components/customer-trend-chart";
import {
  ChartDateRangeSelector,
  type ChartPreset,
} from "@/features/admin/components/chart-date-range-selector";
import type { CustomerTrendPoint } from "@/lib/repositories/stats";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "システム管理 | FlowRev",
};

type VideoProtectionState =
  | { kind: "unconfigured" }
  | { kind: "error" }
  | { kind: "ok"; unprotected: number; total: number };

async function fetchWhiteLabelCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("white_labels")
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function fetchPlanCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("plans")
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Cloudflare 外部 API を叩かず、DB キャッシュ（video_check_logs）から取得する */
async function fetchVideoProtectionState(): Promise<VideoProtectionState> {
  try {
    const settings = await getCloudflareSettingsMasked();
    if (!settings?.accountId || !settings?.hasApiToken) return { kind: "unconfigured" };
    const latestLog = await getLatestVideoCheckLog();
    if (!latestLog) return { kind: "ok", unprotected: 0, total: 0 };
    return { kind: "ok", unprotected: latestLog.unprotected, total: latestLog.total };
  } catch {
    return { kind: "error" };
  }
}

/** ISO 文字列を JST の YYYY-MM-DD キーに変換する（年跨ぎ衝突を防ぐ） */
function toJstDateKey(isoString: string): string {
  const d = new Date(isoString);
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function fetchCustomerTrend(options: {
  from?: string;
  to?: string;
}): Promise<CustomerTrendPoint[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("customers")
      .select("created_at")
      .order("created_at", { ascending: true });
    if (options.from) q = q.gte("created_at", `${options.from}T00:00:00.000Z`);
    if (options.to) q = q.lte("created_at", `${options.to}T23:59:59.999Z`);
    const { data } = await q;
    const rows = (data ?? []) as Record<string, unknown>[];
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const key = toJstDateKey(row.created_at as string);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        label: date.slice(5).replace("-", "/"),
        count,
      }));
  } catch {
    return [];
  }
}

const VALID_PRESETS: ChartPreset[] = ["7d", "30d", "all", "custom"];

function parseChartPreset(raw: string | undefined): ChartPreset {
  return VALID_PRESETS.includes(raw as ChartPreset) ? (raw as ChartPreset) : "30d";
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function presetToDateRange(
  preset: ChartPreset,
  chartFrom: string,
  chartTo: string,
): { from?: string; to?: string } {
  const now = new Date();
  if (preset === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { from: toIsoDate(from), to: toIsoDate(now) };
  }
  if (preset === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from: toIsoDate(from), to: toIsoDate(now) };
  }
  if (preset === "all") return {};
  return { from: chartFrom || undefined, to: chartTo || undefined };
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: {
    chartPreset?: string;
    chartFrom?: string;
    chartTo?: string;
  };
}) {
  const currentChartPreset = parseChartPreset(searchParams.chartPreset);
  const currentChartFrom = searchParams.chartFrom ?? "";
  const currentChartTo = searchParams.chartTo ?? "";
  const chartDateRange = presetToDateRange(currentChartPreset, currentChartFrom, currentChartTo);

  const [session, videoState, whiteLabelCount, planCount, trendData] =
    await Promise.all([
      getSessionProfile(),
      fetchVideoProtectionState(),
      fetchWhiteLabelCount(),
      fetchPlanCount(),
      fetchCustomerTrend(chartDateRange),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          システム管理ダッシュボード
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ようこそ、{session?.displayName ?? session?.email ?? "管理者"} さん
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/white-labels"
          className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent/30"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            ホワイトラベル
          </span>
          <span className="text-3xl font-bold text-foreground">{whiteLabelCount}</span>
          <span className="text-xs text-muted-foreground mt-0.5">件 · 一覧を見る →</span>
        </Link>
        <Link
          href="/admin/plans"
          className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent/30"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            プラン
          </span>
          <span className="text-3xl font-bold text-foreground">{planCount}</span>
          <span className="text-xs text-muted-foreground mt-0.5">件 · 一覧を見る →</span>
        </Link>
        <VideoProtectionCard initialState={videoState} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-foreground">
            全テナント顧客登録数の推移
          </h2>
          <ChartDateRangeSelector
            currentPreset={currentChartPreset}
            currentFrom={currentChartFrom}
            currentTo={currentChartTo}
          />
        </div>
        <p className="text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
          {currentChartPreset === "7d" && "過去7日間"}
          {currentChartPreset === "30d" && "過去30日間"}
          {currentChartPreset === "all" && "全期間"}
          {currentChartPreset === "custom" && (currentChartFrom || currentChartTo
            ? `${currentChartFrom || "開始日未設定"} 〜 ${currentChartTo || "終了日未設定"}`
            : "期間指定なし")}
          {"のシステム全体の顧客登録数"}（日別・全ホワイトラベル合計）
        </p>
        <CustomerTrendChart data={trendData} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-foreground">
          管理メニュー
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/white-labels"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ホワイトラベル管理
          </Link>
          <Link
            href="/admin/plans"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            プラン管理
          </Link>
          <Link
            href="/admin/settings/email"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            メール設定
          </Link>
          <Link
            href="/admin/settings/ai"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            AI設定 (Anthropic)
          </Link>
          <Link
            href="/admin/settings/openai"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            AI設定 (OpenAI)
          </Link>
          <Link
            href="/admin/settings/cloudflare"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Cloudflare 設定
          </Link>
        </div>
      </div>
    </div>
  );
}
