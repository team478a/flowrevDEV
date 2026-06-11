import Link from "next/link";
import {
  Users,
  Package,
  LayoutTemplate,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { getSessionProfile } from "@/features/auth/session";
import {
  getDashboardStats,
  getRecentCustomers,
  getCustomerRegistrationTrend,
} from "@/lib/repositories/stats";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { RecentCustomers } from "@/features/dashboard/components/recent-customers";
import { CustomerTrendChart } from "@/features/dashboard/components/customer-trend-chart";
import {
  ChartDateRangeSelector,
  type ChartPreset,
} from "@/features/admin/components/chart-date-range-selector";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ダッシュボード | FlowRev",
};

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    chartPreset?: string;
    chartFrom?: string;
    chartTo?: string;
  };
}) {
  const session = await getSessionProfile();
  const whiteLabelId = session?.whiteLabelId ?? null;

  const currentChartPreset = parseChartPreset(searchParams.chartPreset);
  const currentChartFrom = searchParams.chartFrom ?? "";
  const currentChartTo = searchParams.chartTo ?? "";
  const chartDateRange = presetToDateRange(currentChartPreset, currentChartFrom, currentChartTo);

  let stats = {
    customerTotal: 0,
    customerNewThisWeek: 0,
    customerInactive: 0,
    productTotal: 0,
    lpTotal: 0,
    courseTotal: 0,
    scenarioActive: 0,
  };
  let recentCustomers: Awaited<ReturnType<typeof getRecentCustomers>> = [];
  let trendData: Awaited<ReturnType<typeof getCustomerRegistrationTrend>> = [];

  try {
    [stats, recentCustomers, trendData] = await Promise.all([
      getDashboardStats({ whiteLabelId }),
      getRecentCustomers(5, { whiteLabelId }),
      getCustomerRegistrationTrend({ whiteLabelId, ...chartDateRange }),
    ]);
  } catch {
    // Supabase 未接続時はゼロ表示
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ようこそ、{session?.displayName ?? session?.email ?? "ゲスト"} さん
        </p>
      </div>

      {stats.customerInactive > 0 && (
        <Link
          href="/customers?filter=inactive"
          className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>{stats.customerInactive} 人</strong>
            の顧客が 7 日以上アクションをしていません。フォローを検討してください。
          </span>
          <span className="ml-auto text-xs underline">確認する →</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          href="/customers"
          icon={<Users className="h-4 w-4" />}
          label="顧客数"
          value={stats.customerTotal}
          sub={
            stats.customerNewThisWeek > 0 ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                今週 +{stats.customerNewThisWeek} 人
              </span>
            ) : (
              "今週の新規なし"
            )
          }
        />
        <KpiCard
          href="/lp"
          icon={<LayoutTemplate className="h-4 w-4" />}
          label="LP数"
          value={stats.lpTotal}
        />
        <KpiCard
          href="/products"
          icon={<Package className="h-4 w-4" />}
          label="商品数"
          value={stats.productTotal}
        />
        <KpiCard
          href="/customers?filter=inactive"
          icon={<AlertTriangle className="h-4 w-4" />}
          label="未アクション"
          value={stats.customerInactive}
          sub="7日以上アクションなし"
          warn={stats.customerInactive > 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          href="/members"
          icon={<BookOpen className="h-4 w-4" />}
          label="コース数"
          value={stats.courseTotal}
        />
        <KpiCard
          href="/scenarios"
          icon={<Zap className="h-4 w-4" />}
          label="有効シナリオ"
          value={stats.scenarioActive}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-foreground">顧客登録数の推移</h2>
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
          {"の顧客登録数"}（日別）
        </p>
        <CustomerTrendChart data={trendData} />
      </div>

      <RecentCustomers customers={recentCustomers} />

      {stats.customerTotal === 0 && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold">はじめに</h2>
          <ol className="flex flex-col gap-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              <Link href="/products" className="text-primary hover:underline">
                商品管理
              </Link>{" "}
              で商品を登録する
            </li>
            <li>
              <Link href="/lp" className="text-primary hover:underline">
                LP管理
              </Link>{" "}
              でランディングページを作成する
            </li>
            <li>
              <Link href="/customers/new" className="text-primary hover:underline">
                顧客を招待
              </Link>{" "}
              してコースを公開する
            </li>
          </ol>
        </section>
      )}
    </div>
  );
}
