import Link from "next/link";
import {
  Users,
  Package,
  LayoutTemplate,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Zap,
  UserPlus,
} from "lucide-react";
import { getSessionProfile } from "@/features/auth/session";
import { getDashboardStats, getRecentCustomers } from "@/lib/repositories/stats";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ダッシュボード | FlowRev",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sourceLabel(s: string): string {
  if (s === "lp") return "LP";
  if (s === "import") return "インポート";
  return "手動";
}

interface KpiCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: React.ReactNode;
  warn?: boolean;
}

function KpiCard({ href, icon, label, value, sub, warn }: KpiCardProps) {
  return (
    <Link
      href={href}
      className={[
        "flex flex-col gap-2 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/50",
        warn ? "border-amber-300 bg-amber-50/60" : "border-border",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className={warn ? "text-amber-500" : "text-muted-foreground"}>
          {icon}
        </span>
      </div>
      <span
        className={[
          "text-3xl font-bold",
          warn ? "text-amber-700" : "text-foreground",
        ].join(" ")}
      >
        {value.toLocaleString()}
      </span>
      {sub && (
        <span className="text-xs text-muted-foreground">{sub}</span>
      )}
    </Link>
  );
}

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

      {/* KPIカード */}
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
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            直近の顧客登録
          </h2>
          <Link
            href="/customers"
            className="text-xs text-primary hover:underline"
          >
            すべて見る →
          </Link>
        </div>

        {recentCustomers.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground text-center">
            まだ顧客がいません。
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentCustomers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {c.name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {c.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {sourceLabel(c.source)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

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
