import Link from "next/link";
import { WhiteLabelForm } from "@/features/admin/components/white-label-form";
import { listPlans } from "@/lib/repositories/plans";
import { requireSystemAdmin } from "@/features/admin/guard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ホワイトラベル作成 | FlowRev",
};

export default async function NewWhiteLabelPage() {
  await requireSystemAdmin();
  const plans = await listPlans();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
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
    </main>
  );
}
