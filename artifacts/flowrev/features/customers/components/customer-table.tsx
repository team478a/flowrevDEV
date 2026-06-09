import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { CustomerRow } from "@/lib/repositories/customers";

interface CustomerTableProps {
  customers: CustomerRow[];
}

const INACTIVE_THRESHOLD_DAYS = 7;

/**
 * 最終アクションから INACTIVE_THRESHOLD_DAYS 日以上経過しているか。
 * null（未接触）は別扱いとし、ハイライトしない。
 */
function isStale(lastActionAt: string | null): boolean {
  if (!lastActionAt) return false;
  const diffMs = Date.now() - new Date(lastActionAt).getTime();
  return diffMs > INACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomerTable({ customers }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        顧客がまだいません。「新規登録」から追加してください。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              氏名 / メール
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              ステータス
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              タグ
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              最終アクション
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              登録日
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const stale = isStale(c.lastActionAt);
            const untouched = c.lastActionAt === null;
            return (
              <tr
                key={c.id}
                className={[
                  "border-b last:border-0 hover:bg-accent/40 transition-colors",
                  stale ? "bg-amber-50/60" : "",
                ].join(" ")}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/customers/${c.id}`}
                    className="flex flex-col gap-0.5 hover:underline"
                  >
                    <span className="font-medium">
                      {c.name ?? <span className="text-muted-foreground">—</span>}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[14rem]">
                      {c.email}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={c.status === "active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {c.status === "active" ? "アクティブ" : "無効"}
                  </Badge>
                  {stale && (
                    <span className="ml-2 text-xs text-amber-600 font-medium">
                      未アクション
                    </span>
                  )}
                  {untouched && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      未接触
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.length === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      c.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                    {c.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{c.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(c.lastActionAt)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(c.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
