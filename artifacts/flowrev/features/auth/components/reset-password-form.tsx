"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "../actions";

const initial: ResetState = { error: null, success: null };

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      {pending ? "送信中..." : "リセットメールを送信"}
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useFormState(requestPasswordReset, initial);

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-5">
          <p className="text-sm font-medium text-green-700">{state.success}</p>
          <p className="mt-1 text-xs text-green-600">
            メールに記載のリンクからパスワードを再設定してください。
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm text-primary hover:underline"
        >
          ← ログインに戻る
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
        <p className="text-xs text-muted-foreground">
          登録済みのメールアドレスにリセットリンクを送信します。
        </p>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitBtn />

      <Link
        href="/login"
        className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← ログインに戻る
      </Link>
    </form>
  );
}
