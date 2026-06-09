import Link from "next/link";
import { PlaceholderHome } from "@/features/auth/components/placeholder-home";
import { getSessionProfile } from "@/features/auth/session";

export default async function WhiteLabelDashboardPage() {
  const session = await getSessionProfile();
  return (
    <PlaceholderHome
      title="ホワイトラベル管理ダッシュボード"
      role={session?.role ?? null}
      email={session?.email ?? null}
      displayName={session?.displayName ?? null}
    >
      <Link
        href="/wl/clients"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        クライアント管理
      </Link>
    </PlaceholderHome>
  );
}
