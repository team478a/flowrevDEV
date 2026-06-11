"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";

export interface AlertEmailsFormState {
  error: string | null;
  success?: boolean;
}

interface AlertEmailsFormProps {
  currentEmails: string | null;
  action: (
    prev: AlertEmailsFormState,
    formData: FormData,
  ) => Promise<AlertEmailsFormState>;
}

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "保存中..." : "保存する"}
    </button>
  );
}

export function AlertEmailsForm({ currentEmails, action }: AlertEmailsFormProps) {
  const [state, formAction] = useFormState(action, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="alertEmails" className="text-sm font-medium text-foreground">
          アラート通知先メールアドレス
        </label>
        <input
          id="alertEmails"
          name="alertEmails"
          type="text"
          placeholder="admin@example.com, monitor@example.com"
          defaultValue={currentEmails ?? ""}
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">
          カンマ区切りで複数アドレスを指定できます。空欄にすると system_admin のメールアドレスに通知します。
        </p>
      </div>

      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>通知先を保存しました。</span>
        </div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
