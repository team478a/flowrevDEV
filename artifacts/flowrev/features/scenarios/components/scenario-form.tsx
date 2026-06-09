"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScenarioActionState } from "@/features/scenarios/actions";
import type { ScenarioRow } from "@/lib/repositories/scenarios";
import { TRIGGER_TYPES } from "@/features/scenarios/schema";

interface ScenarioFormProps {
  action: (
    prev: ScenarioActionState,
    formData: FormData,
  ) => Promise<ScenarioActionState>;
  defaultValues?: Partial<ScenarioRow>;
  submitLabel: string;
  successPath?: string;
}

const initialState: ScenarioActionState = { error: null, success: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中…" : label}
    </Button>
  );
}

export function ScenarioForm({
  action,
  defaultValues,
  submitLabel,
  successPath,
}: ScenarioFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.success === true && successPath) {
      router.push(successPath);
    }
  }, [state.success, router, successPath]);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">シナリオ名 *</Label>
        <Input
          id="name"
          name="name"
          placeholder="例：購入後フォローアップ"
          defaultValue={defaultValues?.name ?? ""}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="triggerType">トリガー *</Label>
        <Select
          name="triggerType"
          defaultValue={defaultValues?.triggerType ?? "manual"}
        >
          <SelectTrigger id="triggerType">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {TRIGGER_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">ステータス *</Label>
        <Select
          name="status"
          defaultValue={defaultValues?.status ?? "active"}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">有効</SelectItem>
            <SelectItem value="inactive">無効</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
