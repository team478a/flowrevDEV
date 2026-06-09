import { AppShell } from "@/features/dashboard/components/app-shell";
import { requireClientOwner } from "@/features/wl/guard";
import type { NavItem } from "@/features/dashboard/components/sidebar-nav";

export const dynamic = "force-dynamic";

const NAV_ITEMS: NavItem[] = [
  { label: "ダッシュボード", href: "/dashboard", icon: "⊞" },
  { label: "商品管理", href: "/products", icon: "📦" },
  { label: "LP管理", href: "/lp", icon: "📄" },
  { label: "顧客管理", href: "/customers", icon: "👥" },
  { label: "コース管理", href: "/members", icon: "🎓" },
  { label: "シナリオ", href: "/scenarios", icon: "⚡" },
  { label: "設定", href: "/settings", icon: "⚙️" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClientOwner();

  return (
    <AppShell
      brand="FlowRev"
      items={NAV_ITEMS}
      userName={session.displayName}
      userEmail={session.email}
    >
      {children}
    </AppShell>
  );
}
