import Link from "next/link";
import { requireWhiteLabelOwner } from "@/features/wl/guard";
import { listWLPlansFull } from "@/lib/repositories/plans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "プラン管理 | FlowRev WL",
};

export default async function WLPlansPage() {
  const session = await requireWhiteLabelOwner();
  const items = await listWLPlansFull(session.whiteLabelId!);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            プラン管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            クライアントに割り当てるプランを管理します。
          </p>
        </div>
        <Link
          href="/wl/plans/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          新規作成
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            プランがまだありません。「新規作成」から追加してください。
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">プラン名</th>
                <th className="px-4 py-3 text-right font-medium">月額</th>
                <th className="px-4 py-3 text-right font-medium">クライアント上限</th>
                <th className="px-4 py-3 text-right font-medium">商品上限</th>
                <th className="px-4 py-3 text-right font-medium">顧客上限</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((p) => (
                <tr key={p.id} className="bg-card">
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    ¥{p.priceMonthly.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {p.maxClients.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {p.maxProducts.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {p.maxCustomers.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
