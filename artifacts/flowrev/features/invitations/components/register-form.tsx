"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  acceptInvitationAction,
  type AcceptInvitationState,
} from "../accept-actions";

const initialState: AcceptInvitationState = { error: null };

const inputClass =
  "h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70";
const labelClass = "text-sm font-medium text-foreground";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "登録中..." : "登録してはじめる"}
    </button>
  );
}

export function RegisterForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [state, formAction] = useFormState(
    acceptInvitationAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          disabled
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClass}>
          パスワード <span className="text-destructive">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">8文字以上</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className={labelClass}>
          パスワード（確認） <span className="text-destructive">*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
