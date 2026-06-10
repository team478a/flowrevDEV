import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWhiteLabelOwner } from "@/features/wl/guard";
import { getWLPlan } from "@/lib/repositories/plans";
import { WLPlanEditForm } from "@/features/wl/components/wl-plan-edit-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "プラン編集 | FlowRev WL",
};

interface Props {
  params: { id: string };
}

export default async function WLPlanEditPage({ params }: Props) {
  const session = await requireWhiteLabelOwner();
  const plan = await getWLPlan(params.id, session.whiteLabelId);

  if (!plan) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/wl/plans"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← プラン管理
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          プラン編集
        </h1>
        <p className="text-sm text-muted-foreground">
          「{plan.name}」の内容を変更します。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <WLPlanEditForm plan={plan} />
      </div>
    </div>
  );
}
