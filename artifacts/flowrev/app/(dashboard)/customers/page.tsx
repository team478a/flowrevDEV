import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { listCustomers } from "@/lib/repositories/customers";
import { CustomerTable } from "@/features/customers/components/customer-table";
import { CsvExportButton } from "@/features/customers/components/csv-export-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const INACTIVE_THRESHOLD_DAYS = 7;

function isInactive(lastActionAt: string | null): boolean {
  if (!lastActionAt) return true;
  const diffMs = Date.now() - new Date(lastActionAt).getTime();
  return diffMs > INACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

interface Props {
  searchParams: { filter?: string };
}

export default async function CustomersPage({ searchParams }: Props) {
  let customers: Awaited<ReturnType<typeof listCustomers>> = [];

  try {
    customers = await listCustomers();
  } catch {
    customers = [];
  }

  const inactiveOnly = searchParams.filter === "inactive";
  const displayCustomers = inactiveOnly
    ? customers.filter((c) => isInactive(c.lastActionAt))
    : customers;

  const inactiveCount = customers.filter((c) =>
    isInactive(c.lastActionAt),
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">顧客管理</h1>
          {customers.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              全 {customers.length} 件
              {inactiveCount > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  · 未アクション {inactiveCount} 件
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 未アクションフィルター切替 */}
          {inactiveOnly ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/customers">全員を表示</Link>
            </Button>
          ) : (
            inactiveCount > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/customers?filter=inactive">
                  未アクションのみ（{inactiveCount}件）
                </Link>
              </Button>
            )
          )}

          {/* CSV エクスポート */}
          <CsvExportButton
            inactiveOnly={false}
            label="CSV出力"
            disabled={customers.length === 0}
          />
          {inactiveCount > 0 && (
            <CsvExportButton
              inactiveOnly={true}
              label="未アクションCSV"
            />
          )}

          <Button asChild size="sm">
            <Link href="/customers/new">
              <Plus className="h-4 w-4 mr-1.5" />
              新規登録
            </Link>
          </Button>
        </div>
      </div>

      {inactiveOnly && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {INACTIVE_THRESHOLD_DAYS}日以上アクションがない顧客を表示しています（未接触を含む）。
        </div>
      )}

      {displayCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Users className="h-10 w-10 mb-3 opacity-30" />
          {inactiveOnly ? (
            <p className="text-sm">未アクションの顧客はいません。</p>
          ) : (
            <>
              <p className="text-sm">顧客がまだいません。</p>
              <p className="text-xs mt-1">
                「新規登録」から手動で追加できます。
              </p>
            </>
          )}
        </div>
      ) : (
        <CustomerTable customers={displayCustomers} />
      )}
    </div>
  );
}
