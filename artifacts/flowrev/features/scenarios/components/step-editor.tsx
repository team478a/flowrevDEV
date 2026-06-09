"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StepRow } from "@/lib/repositories/scenarios";
import type {
  addStepAction,
  updateStepAction,
  deleteStepAction,
} from "@/features/scenarios/actions";
import {
  StepFormFields,
  emptyStepForm,
  type StepFormData,
} from "@/features/scenarios/components/step-form-fields";

interface StepEditorProps {
  scenarioId: string;
  steps: StepRow[];
  addAction: typeof addStepAction;
  updateAction: typeof updateStepAction;
  deleteAction: typeof deleteStepAction;
}

const INITIAL_STATE = { error: null as string | null };

function stepToForm(step: StepRow): StepFormData {
  return {
    delayDays: String(step.delayDays),
    subject: step.subject ?? "",
    body: step.body,
  };
}

function buildFormData(values: StepFormData): FormData {
  const fd = new FormData();
  fd.set("delayDays", values.delayDays);
  fd.set("subject", values.subject);
  fd.set("body", values.body);
  return fd;
}

export function StepEditor({
  scenarioId,
  steps,
  addAction,
  updateAction,
  deleteAction,
}: StepEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<StepFormData>(emptyStepForm());
  const [editForm, setEditForm] = useState<StepFormData>(emptyStepForm());
  const [error, setError] = useState<string | null>(null);

  function startEdit(step: StepRow) {
    setEditingStepId(step.id);
    setEditForm(stepToForm(step));
    setError(null);
  }

  function handleAddField(field: keyof StepFormData, value: string) {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditField(field: keyof StepFormData, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAdd() {
    startTransition(async () => {
      const result = await addAction(
        scenarioId,
        INITIAL_STATE,
        buildFormData(addForm),
      );
      if (result.error) {
        setError(result.error);
      } else {
        setAddForm(emptyStepForm());
        setShowAddForm(false);
        setError(null);
        router.refresh();
      }
    });
  }

  function handleUpdate(stepId: string) {
    startTransition(async () => {
      const result = await updateAction(
        stepId,
        scenarioId,
        INITIAL_STATE,
        buildFormData(editForm),
      );
      if (result.error) {
        setError(result.error);
      } else {
        setEditingStepId(null);
        setError(null);
        router.refresh();
      }
    });
  }

  function handleDelete(stepId: string) {
    startTransition(async () => {
      const result = await deleteAction(stepId, scenarioId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {steps.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground">
          まだステップがありません。追加してください。
        </p>
      )}

      {steps.map((step) => (
        <div
          key={step.id}
          className="border rounded-lg p-4 bg-card flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              ステップ {step.stepNumber}　
              <span className="font-normal">
                {step.delayDays === 0 ? "即時送信" : `${step.delayDays}日後`}
              </span>
            </span>
            {editingStepId !== step.id && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(step)}
                  disabled={isPending}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  編集
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(step.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  削除
                </Button>
              </div>
            )}
          </div>

          {editingStepId === step.id ? (
            <>
              <StepFormFields values={editForm} onChange={handleEditField} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleUpdate(step.id)}
                  disabled={isPending}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  {isPending ? "保存中…" : "保存"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStepId(null)}
                  disabled={isPending}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  キャンセル
                </Button>
              </div>
            </>
          ) : (
            <>
              {step.subject && (
                <p className="text-sm font-medium">{step.subject}</p>
              )}
              <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                {step.body}
              </p>
            </>
          )}
        </div>
      ))}

      {showAddForm && (
        <div className="border border-dashed rounded-lg p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">新しいステップを追加</p>
          <StepFormFields values={addForm} onChange={handleAddField} />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={isPending}
            >
              {isPending ? "追加中…" : "追加する"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setAddForm(emptyStepForm());
                setError(null);
              }}
              disabled={isPending}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            setShowAddForm(true);
            setError(null);
          }}
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          ステップを追加
        </Button>
      )}
    </div>
  );
}
