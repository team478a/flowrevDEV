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
import { getDashboardStats, getRecentCustomers } from "@/lib/repositories/stats";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { RecentCustomers } from "@/features/dashboard/components/recent-customers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ダッシュボード | FlowRev",
};

export default async function DashboardPage() {
  const session = await getSessionProfile();

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

  try {
    [stats, recentCustomers] = await Promise.all([
      getDashboardStats(),
      getRecentCustomers(5),
    ]);
  } catch {
    // Supabase 未接続時はゼロ表示
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ようこそ、{session?.displayName ?? session?.email ?? "ゲスト"} さん
        </p>
      </div>

      {/* 未アクションアラート */}
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

      {/* KPIカード 1行目 */}
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
          href="/customers?filter=inactive"
          icon={<AlertTriangle className="h-4 w-4" />}
          label="未アクション"
          value={stats.customerInactive}
          sub="7日以上アクションなし"
          warn={stats.customerInactive > 0}
        />
        <KpiCard
          href="/products"
          icon={<Package className="h-4 w-4" />}
          label="商品数"
          value={stats.productTotal}
        />
        <KpiCard
          href="/lp"
          icon={<LayoutTemplate className="h-4 w-4" />}
          label="LP数"
          value={stats.lpTotal}
        />
      </div>

      {/* KPIカード 2行目 */}
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

      {/* 直近の顧客登録 */}
      <RecentCustomers customers={recentCustomers} />

      {/* はじめにガイド（顧客がゼロのときだけ表示） */}
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
