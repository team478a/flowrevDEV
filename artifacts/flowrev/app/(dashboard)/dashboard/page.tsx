import { getSessionProfile } from "@/features/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ダッシュボード | FlowRev",
};

export default async function DashboardPage() {
  const session = await getSessionProfile();

  const stats = [
    { label: "商品", value: "—", href: "/products" },
    { label: "LP", value: "—", href: "/lp" },
    { label: "顧客", value: "—", href: "/customers" },
    { label: "コース", value: "—", href: "/members" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          ダッシュボード
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ようこそ、{session?.displayName ?? session?.email ?? "ゲスト"} さん
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent/50"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </span>
            <span className="text-3xl font-bold text-foreground">{s.value}</span>
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-foreground">
          はじめに
        </h2>
        <ol className="flex flex-col gap-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>
            <a href="/products" className="text-primary hover:underline">
              商品管理
            </a>{" "}
            で商品を登録する
          </li>
          <li>
            <a href="/lp" className="text-primary hover:underline">
              LP管理
            </a>{" "}
            でランディングページを作成する
          </li>
          <li>顧客を招待してコースを公開する</li>
        </ol>
      </div>
    </div>
  );
}
