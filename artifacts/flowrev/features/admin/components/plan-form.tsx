"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { createPlanAction, type CreatePlanState } from "../actions";

const initialState: CreatePlanState = { error: null };

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
      {pending ? "作成中..." : "プランを作成"}
    </button>
  );
}

export function PlanForm() {
  const [state, formAction] = useFormState(createPlanAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          プラン名 <span className="text-destructive">*</span>
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="priceMonthly" className={labelClass}>
            月額（円） <span className="text-destructive">*</span>
          </label>
          <input
            id="priceMonthly"
            name="priceMonthly"
            type="number"
            min={0}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxClients" className={labelClass}>
            最大クライアント数 <span className="text-destructive">*</span>
          </label>
          <input
            id="maxClients"
            name="maxClients"
            type="number"
            min={0}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxProducts" className={labelClass}>
            最大商品数 <span className="text-destructive">*</span>
          </label>
          <input
            id="maxProducts"
            name="maxProducts"
            type="number"
            min={0}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxCustomers" className={labelClass}>
            最大顧客数 <span className="text-destructive">*</span>
          </label>
          <input
            id="maxCustomers"
            name="maxCustomers"
            type="number"
            min={0}
            required
            className={inputClass}
          />
        </div>
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
          href="/admin/plans"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
