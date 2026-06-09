import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ScenarioForm } from "@/features/scenarios/components/scenario-form";
import { createScenarioAction } from "@/features/scenarios/actions";

export const dynamic = "force-dynamic";

export default function NewScenarioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/scenarios"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          シナリオ一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">シナリオを作成</h1>
      </div>

      <ScenarioForm
        action={createScenarioAction}
        submitLabel="作成して編集へ"
      />
    </div>
  );
}
