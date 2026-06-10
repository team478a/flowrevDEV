import Link from "next/link";
import { WLPlanForm } from "@/features/wl/components/wl-plan-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "プラン作成 | FlowRev WL",
};

export default async function NewWLPlanPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/wl/plans"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← プラン一覧
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          プラン作成
        </h1>
        <p className="text-sm text-muted-foreground">
          クライアント向けの新しいプランを作成します。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <WLPlanForm />
      </div>
    </div>
  );
}
