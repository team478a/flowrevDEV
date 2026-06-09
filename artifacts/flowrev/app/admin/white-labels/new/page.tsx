import Link from "next/link";
import { WhiteLabelForm } from "@/features/admin/components/white-label-form";
import { listPlans } from "@/lib/repositories/plans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ホワイトラベル作成 | FlowRev",
};

export default async function NewWhiteLabelPage() {
  const plans = await listPlans();

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
          ホワイトラベルを作成
        </h1>
        <p className="text-sm text-muted-foreground">
          事業者ブランドとオーナーアカウントを作成します。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <WhiteLabelForm plans={plans} />
      </div>
    </div>
  );
}
