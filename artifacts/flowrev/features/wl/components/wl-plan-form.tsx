"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { createWLPlanAction, type CreateWLPlanState } from "../actions";
import { PLAN_FEATURE_DEFS, PLAN_FEATURE_CATEGORIES } from "@/lib/features/plan-features";

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
    <form action={formAction} className="flex flex-col gap-6">
      {/* 基本情報 */}
      <section className="flex flex-col gap-4 rounded-lg border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground">基本情報</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            プラン名 <span className="text-destructive">*</span>
          </label>
          <input id="name" name="name" required placeholder="例：スタンダードプラン" className={inputClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              placeholder="例：9800"
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
              placeholder="例：10"
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
              placeholder="例：50"
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
              placeholder="例：500"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* 機能フラグ（カテゴリ別） */}
      <section className="flex flex-col gap-4 rounded-lg border border-border p-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">機能フラグ</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            ONにした機能がクライアントの管理画面で利用可能になります。プラン間の差別化にご活用ください。
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {PLAN_FEATURE_CATEGORIES.map((cat) => {
            const defs = PLAN_FEATURE_DEFS.filter((f) => f.category === cat.key);
            if (defs.length === 0) return null;
            return (
              <div key={cat.key} className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cat.label}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {defs.map((f) => (
                    <label
                      key={f.key}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-input p-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <input
                        type="checkbox"
                        name={`feature_${f.key}`}
                        defaultChecked={false}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium leading-none">{f.label}</span>
                        <span className="text-xs text-muted-foreground">{f.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
