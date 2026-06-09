import Link from "next/link";
import { listWhiteLabels } from "@/lib/repositories/white-labels";
import { requireSystemAdmin } from "@/features/admin/guard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ホワイトラベル管理 | FlowRev",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ja-JP");
}

export default async function WhiteLabelsPage() {
  await requireSystemAdmin();
  const items = await listWhiteLabels();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 管理ダッシュボード
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ホワイトラベル管理
          </h1>
        </div>
        <Link
          href="/admin/white-labels/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          新規作成
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          ホワイトラベルはまだ登録されていません。
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">ブランド</th>
                <th className="px-4 py-3 font-medium">オーナー</th>
                <th className="px-4 py-3 font-medium">プラン</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">作成日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((wl) => (
                <tr key={wl.id} className="bg-card">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full border border-border"
                        style={{ backgroundColor: wl.brandColor ?? "#3B82F6" }}
                      />
                      <span className="font-medium text-foreground">
                        {wl.brandName}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {wl.ownerEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {wl.planName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {wl.status ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(wl.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
