import Link from "next/link";
import { getSessionProfile } from "@/features/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "WLダッシュボード | FlowRev",
};

export default async function WhiteLabelDashboardPage() {
  const session = await getSessionProfile();

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            クライアント
          </span>
          <span className="text-3xl font-bold text-foreground">—</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-foreground">
          クイックアクション
        </h2>
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
      </div>
    </div>
  );
}
