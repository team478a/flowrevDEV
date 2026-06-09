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
    />
  );
}
