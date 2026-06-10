"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  updateDisplayNameAction,
  type SettingsState,
} from "../actions";

const initial: SettingsState = { error: null, success: null };

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      {pending ? "保存中..." : "保存する"}
    </button>
  );
}

interface Props {
  currentDisplayName: string | null;
}

export function DisplayNameForm({ currentDisplayName }: Props) {
  const [state, action] = useFormState(updateDisplayNameAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm font-medium text-foreground">
          表示名
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          defaultValue={currentDisplayName ?? ""}
          placeholder="例：山田 太郎"
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">
          ダッシュボードの挨拶文に表示されます。
        </p>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 border border-green-200">
          {state.success}
        </p>
      )}

      <div>
        <SubmitBtn />
      </div>
    </form>
  );
}
