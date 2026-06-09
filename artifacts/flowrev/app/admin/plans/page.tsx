import Link from "next/link";
import { listPlansFull } from "@/lib/repositories/plans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "プラン管理 | FlowRev",
};

export default async function PlansPage() {
  const items = await listPlansFull();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            プラン管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ホワイトラベル事業者に割り当てるプランを管理します。
          </p>
        </div>
        <Link
          href="/admin/plans/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          新規作成
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-input px-4 py-10 text-center text-sm text-muted-foreground">
          プランがまだありません。「新規作成」から追加してください。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">プラン名</th>
                <th className="px-4 py-3 text-right font-medium">月額</th>
                <th className="px-4 py-3 text-right font-medium">クライアント</th>
                <th className="px-4 py-3 text-right font-medium">商品</th>
                <th className="px-4 py-3 text-right font-medium">顧客</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((p) => (
                <tr key={p.id} className="bg-card">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-right">
                    ¥{p.priceMonthly.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.maxClients.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.maxProducts.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
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
