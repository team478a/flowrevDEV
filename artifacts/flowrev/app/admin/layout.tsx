import { AppShell } from "@/features/dashboard/components/app-shell";
import { requireSystemAdmin } from "@/features/admin/guard";
import type { NavItem } from "@/features/dashboard/components/sidebar-nav";

export const dynamic = "force-dynamic";

const NAV_ITEMS: NavItem[] = [
  { label: "ダッシュボード", href: "/admin/dashboard", icon: "⊞" },
  { label: "ホワイトラベル", href: "/admin/white-labels", icon: "🏷️" },
  { label: "プラン管理", href: "/admin/plans", icon: "📋" },
  { label: "メール設定", href: "/admin/settings/email", icon: "✉️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSystemAdmin();

  return (
    <AppShell
      brand="FlowRev Admin"
      items={NAV_ITEMS}
      userName={session.displayName}
      userEmail={session.email}
    >
      {children}
    </AppShell>
  );
}
