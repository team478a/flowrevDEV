"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  createInvitationAction,
  type CreateInvitationState,
} from "../actions";
import type { PlanOption } from "@/lib/repositories/plans";

const initialState: CreateInvitationState = {
  error: null,
  inviteUrl: null,
  emailSent: false,
  emailError: null,
};

const inputClass =
  "h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-foreground";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "作成中..." : "招待を作成"}
    </button>
  );
}

function InviteResult({
  url,
  emailSent,
  emailError,
}: {
  url: string;
  emailSent: boolean;
  emailError: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3">
      <p className="text-sm font-medium text-emerald-800">
        {emailSent
          ? "招待を作成し、メールを送信しました（7日間有効）。"
          : "招待を作成しました（7日間有効）。"}
      </p>
      {!emailSent && emailError && (
        <p className="text-xs text-amber-700">
          メール送信に失敗しました（{emailError}）。下記URLを手動で共有してください。
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
    </div>
  );
}

export function InvitationForm({ plans }: { plans: PlanOption[] }) {
  const [state, formAction] = useFormState(
    createInvitationAction,
    initialState,
  );

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="clientName" className={labelClass}>
            クライアント名 <span className="text-destructive">*</span>
          </label>
          <input
            id="clientName"
            name="clientName"
            required
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="representativeName" className={labelClass}>
              代表者名 <span className="text-destructive">*</span>
            </label>
            <input
              id="representativeName"
              name="representativeName"
              required
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClass}>
              メールアドレス <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="planId" className={labelClass}>
            プラン
          </label>
          <select id="planId" name="planId" className={inputClass}>
            <option value="">未選択</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}（¥{plan.priceMonthly.toLocaleString()}/月）
              </option>
            ))}
          </select>
        </div>

        {state?.error && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <SubmitButton />
          <Link
            href="/wl/clients"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            一覧へ戻る
          </Link>
        </div>
      </form>

      {state?.inviteUrl && (
        <InviteResult
          url={state.inviteUrl}
          emailSent={state.emailSent}
          emailError={state.emailError}
        />
      )}
    </div>
  );
}
