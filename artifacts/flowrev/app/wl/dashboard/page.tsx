import Link from "next/link";
import { Users, UserCheck, Clock, UserPlus } from "lucide-react";
import { getSessionProfile } from "@/features/auth/session";
import { listInvitations } from "@/lib/repositories/invitations";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "WLダッシュボード | FlowRev",
};

interface KpiCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}

function KpiCard({ href, icon, label, value, sub }: KpiCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <span className="text-3xl font-bold text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </Link>
  );
}

export default async function WhiteLabelDashboardPage() {
  const session = await getSessionProfile();

  let invitations: Awaited<ReturnType<typeof listInvitations>> = [];
  try {
    invitations = await listInvitations();
  } catch {
    invitations = [];
  }

  const total = invitations.length;
  const accepted = invitations.filter((i) => i.status === "accepted").length;
  const pending = invitations.filter((i) => i.status === "pending").length;
  const expired = invitations.filter((i) => i.status === "expired").length;

  const recent = [...invitations]
    .sort((a, b) => {
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    })
    .slice(0, 5);

  const STATUS_LABEL: Record<string, string> = {
    pending: "招待中",
    accepted: "参加済み",
    expired: "期限切れ",
  };

  function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("ja-JP");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ようこそ、{session?.displayName ?? session?.email ?? "ゲスト"} さん
        </p>
      </div>

      {/* KPIカード */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          href="/wl/clients"
          icon={<Users className="h-4 w-4" />}
          label="クライアント（招待）"
          value={total}
          sub="累計招待数"
        />
        <KpiCard
          href="/wl/clients"
          icon={<UserCheck className="h-4 w-4" />}
          label="参加済み"
          value={accepted}
          sub="登録完了"
        />
        <KpiCard
          href="/wl/clients"
          icon={<Clock className="h-4 w-4" />}
          label="招待中"
          value={pending}
          sub="承認待ち"
        />
        <KpiCard
          href="/wl/clients/new"
          icon={<UserPlus className="h-4 w-4" />}
          label="期限切れ"
          value={expired}
          sub="再招待が必要"
        />
      </div>

      {/* 直近の招待 */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold">直近の招待</h2>
          <Link href="/wl/clients" className="text-xs text-primary hover:underline">
            すべて見る →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground text-center">
            まだ招待がありません。
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{inv.clientName}</span>
                  <span className="text-xs text-muted-foreground">{inv.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      inv.status === "accepted"
                        ? "bg-emerald-100 text-emerald-700"
                        : inv.status === "expired"
                          ? "bg-muted text-muted-foreground"
                          : "bg-amber-100 text-amber-700",
                    ].join(" ")}
                  >
                    {STATUS_LABEL[inv.status] ?? inv.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(inv.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* クイックアクション */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">クイックアクション</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/wl/clients/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            クライアントを招待
          </Link>
          <Link
            href="/wl/clients"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            クライアント一覧
          </Link>
        </div>
      </section>
    </div>
  );
}
