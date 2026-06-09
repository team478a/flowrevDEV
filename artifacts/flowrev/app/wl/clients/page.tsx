import Link from "next/link";
import { listInvitations } from "@/lib/repositories/invitations";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "クライアント管理 | FlowRev",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "招待中",
  accepted: "参加済み",
  expired: "期限切れ",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ja-JP");
}

export default async function ClientsPage() {
  const invitations = await listInvitations();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            クライアント管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            クライアントを招待し、招待状況を確認します。
          </p>
        </div>
        <Link
          href="/wl/clients/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          招待を作成
        </Link>
      </div>

      {invitations.length === 0 ? (
        <p className="rounded-md border border-dashed border-input px-4 py-10 text-center text-sm text-muted-foreground">
          招待がまだありません。「招待を作成」から始めてください。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">クライアント名</th>
                <th className="px-4 py-3 font-medium">代表者</th>
                <th className="px-4 py-3 font-medium">メール</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">有効期限</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.map((inv) => (
                <tr key={inv.id} className="bg-card">
                  <td className="px-4 py-3 font-medium">{inv.clientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inv.representativeName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        inv.status === "accepted"
                          ? "bg-emerald-100 text-emerald-700"
                          : inv.status === "expired"
                            ? "bg-muted text-muted-foreground"
                            : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {STATUS_LABEL[inv.status] ?? inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(inv.expiresAt)}
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
