import Link from "next/link";
import { PlaceholderHome } from "@/features/auth/components/placeholder-home";
import { getSessionProfile } from "@/features/auth/session";

export default async function AdminDashboardPage() {
  const session = await getSessionProfile();
  return (
    <PlaceholderHome
      title="システム管理ダッシュボード"
      role={session?.role ?? null}
      email={session?.email ?? null}
      displayName={session?.displayName ?? null}
    >
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
    </PlaceholderHome>
  );
}
