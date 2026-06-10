import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  source: string;
  createdAt: string;
}

interface RecentCustomersProps {
  customers: Customer[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sourceLabel(s: string): string {
  if (s === "lp") return "LP";
  if (s === "import") return "インポート";
  return "手動";
}

export function RecentCustomers({ customers }: RecentCustomersProps) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          直近の顧客登録
        </h2>
        <Link href="/customers" className="text-xs text-primary hover:underline">
          すべて見る →
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground text-center">
          まだ顧客がいません。
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {customers.map((c) => (
            <li key={c.id}>
              <Link
                href={`/customers/${c.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent/40 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {c.name ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{c.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {sourceLabel(c.source)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
