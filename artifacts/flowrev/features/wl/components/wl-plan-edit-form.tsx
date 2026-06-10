"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { updateWLPlanAction, type WLPlanActionState } from "../actions";
import type { PlanRow } from "@/lib/repositories/plans";

const initialState: WLPlanActionState = { error: null };

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
      {pending ? "保存中..." : "保存する"}
    </button>
  );
}

export function WLPlanEditForm({ plan }: { plan: PlanRow }) {
  const boundAction = updateWLPlanAction.bind(null, plan.id);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          プラン名 <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={plan.name}
          className={inputClass}
        />
      </div>

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
          defaultValue={plan.priceMonthly}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxClients" className={labelClass}>
            最大クライアント数
          </label>
          <input
            id="maxClients"
            name="maxClients"
            type="number"
            min={0}
            required
            defaultValue={plan.maxClients}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxProducts" className={labelClass}>
            最大商品数
          </label>
          <input
            id="maxProducts"
            name="maxProducts"
            type="number"
            min={0}
            required
            defaultValue={plan.maxProducts}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxCustomers" className={labelClass}>
            最大顧客数
          </label>
          <input
            id="maxCustomers"
            name="maxCustomers"
            type="number"
            min={0}
            required
            defaultValue={plan.maxCustomers}
            className={inputClass}
          />
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
