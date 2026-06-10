import Link from "next/link";
import { requireWhiteLabelOwner } from "@/features/wl/guard";
import { listClientsForWL } from "@/lib/repositories/clients";
import { listInvitations } from "@/lib/repositories/invitations";
import { WLClientRowActions } from "@/features/wl/components/wl-client-row-actions";
import { InvitationRowActions } from "@/features/invitations/components/invitation-row-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "クライアント管理 | FlowRev",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "招待中",
  expired: "期限切れ",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ja-JP");
}

export default async function ClientsPage() {
  const session = await requireWhiteLabelOwner();
  const [clients, invitations] = await Promise.all([
    listClientsForWL(session.whiteLabelId),
    listInvitations(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            クライアント管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            登録済みクライアントの管理と招待状況を確認します。
          </p>
        </div>
        <Link
          href="/wl/clients/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          招待を作成
        </Link>
      </div>

      {/* 登録済みクライアント */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">
          登録済みクライアント
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {clients.length} 件
          </span>
        </h2>
        {clients.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            まだ登録済みのクライアントがいません。
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">事業者名</th>
                  <th className="px-4 py-3 font-medium">状態</th>
                  <th className="px-4 py-3 font-medium">登録日</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((c) => (
                  <tr key={c.id} className="bg-card">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {c.businessName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          c.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        ].join(" ")}
                      >
                        {c.status === "active" ? "アクティブ" : "停止中"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <WLClientRowActions
                        id={c.id}
                        businessName={c.businessName}
                        status={c.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 招待中 / 期限切れ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">
          招待中 / 期限切れ
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {invitations.length} 件
          </span>
        </h2>
        {invitations.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            保留中の招待はありません。
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
                  <th className="px-4 py-3 font-medium">操作</th>
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
                          inv.status === "expired"
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
                    <td className="px-4 py-3">
                      <InvitationRowActions
                        id={inv.id}
                        email={inv.email}
                        clientName={inv.clientName}
                        status={inv.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
