import { getSessionProfile } from "@/features/auth/session";
import { redirect } from "next/navigation";
import { getPurchasesForClient } from "@/lib/repositories/purchases";
import { ShoppingCart, CheckCircle2, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "購入履歴 | FlowRev",
};

const STATUS_LABEL: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  paid: {
    label: "決済完了",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className: "text-green-700 bg-green-50 border-green-200",
  },
  pending: {
    label: "決済待ち",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "text-yellow-700 bg-yellow-50 border-yellow-200",
  },
  failed: {
    label: "失敗",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className: "text-red-700 bg-red-50 border-red-200",
  },
};

function formatAmount(amount: number, currency: string) {
  if (currency === "jpy") return `¥${amount.toLocaleString()}`;
  return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PurchasesPage() {
  const session = await getSessionProfile();
  if (!session || session.role !== "client_owner") redirect("/login");
  if (!session.clientId) redirect("/dashboard");

  const purchases = await getPurchasesForClient(session.clientId).catch(() => []);

  const totalPaid = purchases
    .filter((p) => p.paymentStatus === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">購入履歴</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stripe 経由での決済記録を確認できます。
        </p>
      </div>

      {/* 集計カード */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">決済件数（完了）</p>
          <p className="mt-1 text-2xl font-bold">
            {purchases.filter((p) => p.paymentStatus === "paid").length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">売上合計</p>
          <p className="mt-1 text-2xl font-bold">¥{totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">総件数</p>
          <p className="mt-1 text-2xl font-bold">{purchases.length}</p>
        </div>
      </div>

      {/* テーブル */}
      {purchases.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">まだ購入記録がありません</p>
          <p className="text-xs text-muted-foreground">
            LP フォームから顧客が決済を完了すると、ここに記録されます。
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">顧客</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">商品</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">金額</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">ステータス</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">決済日時</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map((p) => {
                  const status = STATUS_LABEL[p.paymentStatus] ?? STATUS_LABEL.pending;
                  return (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.customerName ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{p.customerEmail ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.productName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatAmount(p.amount, p.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(p.paidAt ?? p.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
