"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  createWhiteLabelAction,
  type CreateWhiteLabelState,
} from "../actions";
import type { PlanOption } from "@/lib/repositories/plans";

const initialState: CreateWhiteLabelState = { error: null };

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
      {pending ? "作成中..." : "ホワイトラベルを作成"}
    </button>
  );
}

export function WhiteLabelForm({ plans }: { plans: PlanOption[] }) {
  const [state, formAction] = useFormState(
    createWhiteLabelAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="brandName" className={labelClass}>
          ブランド名 <span className="text-destructive">*</span>
        </label>
        <input id="brandName" name="brandName" required className={inputClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ownerEmail" className={labelClass}>
            オーナー メール <span className="text-destructive">*</span>
          </label>
          <input
            id="ownerEmail"
            name="ownerEmail"
            type="email"
            autoComplete="off"
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ownerPassword" className={labelClass}>
            初期パスワード <span className="text-destructive">*</span>
          </label>
          <input
            id="ownerPassword"
            name="ownerPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ownerDisplayName" className={labelClass}>
            オーナー表示名
          </label>
          <input
            id="ownerDisplayName"
            name="ownerDisplayName"
            className={inputClass}
          />
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
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="brandColor" className={labelClass}>
          ブランドカラー
        </label>
        <input
          id="brandColor"
          name="brandColor"
          type="color"
          defaultValue="#3B82F6"
          className="h-11 w-20 cursor-pointer rounded-md border border-input bg-background px-1"
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

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link
          href="/admin/white-labels"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
