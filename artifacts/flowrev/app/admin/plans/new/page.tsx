import Link from "next/link";
import { PlanForm } from "@/features/admin/components/plan-form";
import { requireSystemAdmin } from "@/features/admin/guard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "プラン作成 | FlowRev",
};

export default async function NewPlanPage() {
  await requireSystemAdmin();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">プラン作成</h1>
        <p className="text-sm text-muted-foreground">
          新しいプランを作成します。
        </p>
      </div>

      <PlanForm />

      <Link
        href="/admin/plans"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← プラン一覧へ戻る
      </Link>
    </main>
  );
}
