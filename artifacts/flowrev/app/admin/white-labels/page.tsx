import Link from "next/link";
import { listWhiteLabels } from "@/lib/repositories/white-labels";
import { WhiteLabelDeleteButton } from "@/features/admin/components/white-label-delete-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ホワイトラベル管理 | FlowRev",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ja-JP");
}

export default async function WhiteLabelsPage() {
  const items = await listWhiteLabels();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ホワイトラベル管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            事業者ブランドとオーナーアカウントを管理します。
          </p>
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
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">ブランド</th>
                <th className="px-4 py-3 font-medium">オーナー</th>
                <th className="px-4 py-3 font-medium">プラン</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">作成日</th>
                <th className="px-4 py-3 font-medium">操作</th>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/white-labels/${wl.id}/edit`}
                        className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-accent"
                      >
                        編集
                      </Link>
                      <WhiteLabelDeleteButton
                        id={wl.id}
                        brandName={wl.brandName}
                      />
                    </div>
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
