"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { createWLPlanAction, type CreateWLPlanState } from "../actions";
import { PLAN_FEATURE_DEFS } from "@/lib/features/plan-features";

const initialState: CreateWLPlanState = { error: null };

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

export function WLPlanForm() {
  const [state, formAction] = useFormState(createWLPlanAction, initialState);

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

      <div className="flex flex-col gap-3 rounded-md border border-input p-4">
        <p className={labelClass}>機能フラグ</p>
        <p className="text-xs text-muted-foreground">
          ONにした機能がクライアントの管理画面に表示されます。
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PLAN_FEATURE_DEFS.map((f) => (
            <label
              key={f.key}
              className="flex cursor-pointer items-start gap-2.5 rounded-md p-2 hover:bg-accent"
            >
              <input
                type="checkbox"
                name={`feature_${f.key}`}
                defaultChecked={false}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{f.label}</span>
                <span className="text-xs text-muted-foreground">{f.description}</span>
              </div>
            </label>
          ))}
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
          href="/wl/plans"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
