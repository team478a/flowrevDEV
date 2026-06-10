import Link from "next/link";
import { notFound } from "next/navigation";
import { getWhiteLabel } from "@/lib/repositories/white-labels";
import { listPlans } from "@/lib/repositories/plans";
import { WhiteLabelEditForm } from "@/features/admin/components/white-label-edit-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ホワイトラベル編集 | FlowRev",
};

interface Props {
  params: { id: string };
}

export default async function WhiteLabelEditPage({ params }: Props) {
  const [wl, plans] = await Promise.all([
    getWhiteLabel(params.id),
    listPlans(),
  ]);

  if (!wl) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/white-labels"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← ホワイトラベル一覧
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          ホワイトラベル編集
        </h1>
        <p className="text-sm text-muted-foreground">
          「{wl.brandName}」の設定を変更します。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <WhiteLabelEditForm wl={wl} plans={plans} />
      </div>
    </div>
  );
}
