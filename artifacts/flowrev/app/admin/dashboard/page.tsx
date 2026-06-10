import Link from "next/link";
import { getSessionProfile } from "@/features/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "システム管理 | FlowRev",
};

export default async function AdminDashboardPage() {
  const session = await getSessionProfile();

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
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            ホワイトラベル
          </span>
          <span className="text-3xl font-bold text-foreground">—</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            プラン
          </span>
          <span className="text-3xl font-bold text-foreground">—</span>
        </div>
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
        </div>
      </div>
    </div>
  );
}
