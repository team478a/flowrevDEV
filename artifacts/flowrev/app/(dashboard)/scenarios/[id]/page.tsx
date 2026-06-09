import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getScenario, listSteps } from "@/lib/repositories/scenarios";
import { ScenarioForm } from "@/features/scenarios/components/scenario-form";
import { StepEditor } from "@/features/scenarios/components/step-editor";
import { DeleteScenarioButton } from "@/features/scenarios/components/delete-scenario-button";
import {
  updateScenarioAction,
  deleteScenarioAction,
  addStepAction,
  updateStepAction,
  deleteStepAction,
} from "@/features/scenarios/actions";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function EditScenarioPage({ params }: Props) {
  let scenario: Awaited<ReturnType<typeof getScenario>> = null;
  let steps: Awaited<ReturnType<typeof listSteps>> = [];

  try {
    scenario = await getScenario(params.id);
    if (scenario) steps = await listSteps(params.id);
  } catch {
    scenario = null;
  }

  if (!scenario) notFound();

  const boundUpdate = updateScenarioAction.bind(null, scenario.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/scenarios"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          シナリオ一覧に戻る
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">シナリオを編集</h1>
          <DeleteScenarioButton
            scenarioId={scenario.id}
            scenarioName={scenario.name}
            deleteAction={deleteScenarioAction}
          />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">基本設定</h2>
        <ScenarioForm
          action={boundUpdate}
          defaultValues={scenario}
          submitLabel="保存する"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">
          ステップ一覧（{steps.length}件）
        </h2>
        <StepEditor
          scenarioId={scenario.id}
          steps={steps}
          addAction={addStepAction}
          updateAction={updateStepAction}
          deleteAction={deleteStepAction}
        />
      </section>
    </div>
  );
}
