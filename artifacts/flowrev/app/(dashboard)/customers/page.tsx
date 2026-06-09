import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { listCustomers } from "@/lib/repositories/customers";
import { CustomerTable } from "@/features/customers/components/customer-table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  let customers: Awaited<ReturnType<typeof listCustomers>> = [];

  try {
    customers = await listCustomers();
  } catch {
    customers = [];
  }

  const inactiveCount = customers.filter((c) => {
    if (!c.lastActionAt) return true;
    const diffMs = Date.now() - new Date(c.lastActionAt).getTime();
    return diffMs > 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
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
        <Button asChild size="sm">
          <Link href="/customers/new">
            <Plus className="h-4 w-4 mr-1.5" />
            新規登録
          </Link>
        </Button>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Users className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">顧客がまだいません。</p>
          <p className="text-xs mt-1">
            「新規登録」から手動で追加できます。
          </p>
        </div>
      ) : (
        <CustomerTable customers={customers} />
      )}
    </div>
  );
}
