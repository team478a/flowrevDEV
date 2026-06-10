import Link from "next/link";

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
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function sourceLabel(s: string): string {
  if (s === "lp") return "LP";
  if (s === "import") return "インポート";
  return "手動";
}

function sourceStyle(s: string): string {
  if (s === "lp") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "import") return "bg-sky-50 text-sky-700 border border-sky-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
}

export function RecentCustomers({ customers }: RecentCustomersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">最近の顧客登録</h2>
        <Link href="/customers" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
          すべて見る
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="px-6 py-8 text-sm text-slate-400 text-center">
          まだ顧客がいません。
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">名前</th>
                <th className="px-6 py-3 font-medium">登録元</th>
                <th className="px-6 py-3 font-medium">登録日</th>
                <th className="px-6 py-3 font-medium text-right">詳細</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {c.name ?? <span className="text-slate-400">—</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={[
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      sourceStyle(c.source),
                    ].join(" ")}>
                      {sourceLabel(c.source)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/customers/${c.id}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      詳細 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
