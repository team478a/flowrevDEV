import { AppShell } from "@/features/dashboard/components/app-shell";
import { requireClientOwner } from "@/features/wl/guard";
import type { NavItem } from "@/features/dashboard/components/sidebar-nav";
import { getClientPlanFeatures } from "@/lib/features/client-features";
import { hasFeature, type PlanFeatureKey } from "@/lib/features/plan-features";

export const dynamic = "force-dynamic";

type NavDef = NavItem & { featureKey?: PlanFeatureKey };

const NAV_DEFS: NavDef[] = [
  { label: "ダッシュボード", href: "/dashboard", icon: "⊞" },
  { label: "商品管理", href: "/products", icon: "📦" },
  { label: "LP管理", href: "/lp", icon: "📄", featureKey: "lp_builder" },
  { label: "顧客管理", href: "/customers", icon: "👥" },
  { label: "コース管理", href: "/members", icon: "🎓", featureKey: "member_site" },
  { label: "シナリオ", href: "/scenarios", icon: "⚡", featureKey: "scenarios" },
  { label: "購入履歴", href: "/purchases", icon: "💳" },
  { label: "設定", href: "/settings", icon: "⚙️" },
  { label: "マニュアル", href: "/manual", icon: "📖" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClientOwner();

  const features = session.clientId
    ? await getClientPlanFeatures(session.clientId)
    : {};

  const visibleNavItems: NavItem[] = NAV_DEFS
    .filter((item) => !item.featureKey || hasFeature(features, item.featureKey))
    .map(({ featureKey: _fk, ...rest }) => rest);

  return (
    <AppShell
      brand="FlowRev"
      items={visibleNavItems}
      userName={session.displayName}
      userEmail={session.email}
    >
      {children}
    </AppShell>
  );
}
