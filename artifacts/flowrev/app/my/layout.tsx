import Link from "next/link";
import { getSessionProfile } from "@/features/auth/session";
import { redirect } from "next/navigation";

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
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <Link href="/my" className="font-semibold text-lg tracking-tight">
          マイページ
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/my"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            コース一覧
          </Link>
          <span className="text-muted-foreground">
            {session.displayName ?? session.email}
          </span>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
