"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  updateWhiteLabelAction,
  type UpdateWhiteLabelState,
} from "../actions";
import type { PlanOption } from "@/lib/repositories/plans";
import type { WhiteLabelDetail } from "@/lib/repositories/white-labels";

const initialState: UpdateWhiteLabelState = { error: null, success: false };

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

interface Props {
  wl: WhiteLabelDetail;
  plans: PlanOption[];
}

export function WhiteLabelEditForm({ wl, plans }: Props) {
  const boundAction = updateWhiteLabelAction.bind(null, wl.id);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="brandName" className={labelClass}>
          ブランド名 <span className="text-destructive">*</span>
        </label>
        <input
          id="brandName"
          name="brandName"
          required
          defaultValue={wl.brandName}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="planId" className={labelClass}>
            プラン
          </label>
          <select id="planId" name="planId" defaultValue={wl.planId ?? ""} className={inputClass}>
            <option value="">未選択</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}（¥{p.priceMonthly.toLocaleString()}/月）
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className={labelClass}>
            ステータス
          </label>
          <select id="status" name="status" defaultValue={wl.status} className={inputClass}>
            <option value="active">アクティブ</option>
            <option value="suspended">停止中</option>
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
          defaultValue={wl.brandColor ?? "#3B82F6"}
          className="h-11 w-20 cursor-pointer rounded-md border border-input bg-background px-1"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
