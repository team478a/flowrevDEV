"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AiSettingMasked } from "@/lib/repositories/ai-settings";

interface AiSettingsFormProps {
  current: AiSettingMasked | null;
  action: (
    prev: { error: string | null; success?: boolean },
    formData: FormData,
  ) => Promise<{ error: string | null; success?: boolean }>;
  keyLabel?: string;
  keyPlaceholder?: string;
  modelPlaceholder?: string;
}

const initialState = { error: null, success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中…" : "保存する"}
    </Button>
  );
}

export function AiSettingsForm({
  current,
  action,
  keyLabel = "API キー",
  keyPlaceholder = "sk-...",
  modelPlaceholder = "モデル名を入力",
}: AiSettingsFormProps) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          AI設定を保存しました。
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="apiKey">
          {keyLabel}
          {current?.hasApiKey && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              （設定済み・入力すると上書き）
            </span>
          )}
        </Label>
        <Input
          id="apiKey"
          name="apiKey"
          type="password"
          placeholder={keyPlaceholder}
          autoComplete="off"
          required={!current?.hasApiKey}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="model">
          モデル
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            （空欄 = {modelPlaceholder}）
          </span>
        </Label>
        <Input
          id="model"
          name="model"
          placeholder={modelPlaceholder}
          defaultValue={current?.model ?? ""}
        />
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
