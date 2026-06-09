import { PlaceholderHome } from "@/features/auth/components/placeholder-home";
import { getSessionProfile } from "@/features/auth/session";

export default async function DashboardPage() {
  const session = await getSessionProfile();
  return (
    <PlaceholderHome
      title="ダッシュボード"
      role={session?.role ?? null}
      email={session?.email ?? null}
      displayName={session?.displayName ?? null}
    />
  );
}
