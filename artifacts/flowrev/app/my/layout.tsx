import Link from "next/link";
import { getSessionProfile } from "@/features/auth/session";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (session.role !== "customer") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/my" className="font-semibold text-lg tracking-tight shrink-0">
          マイページ
        </Link>
        <nav className="flex items-center gap-3 text-sm ml-auto">
          <Link
            href="/my"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            コース一覧
          </Link>
          <Link
            href="/my/settings"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            設定
          </Link>
          <span className="hidden sm:inline text-muted-foreground text-xs border-l pl-3">
            {session.displayName ?? session.email}
          </span>
          <LogoutButton />
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
