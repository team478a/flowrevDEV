"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { updateClientAction, type ClientActionState } from "../actions";
import type { ClientRow } from "@/lib/repositories/clients";

const initialState: ClientActionState = { error: null };

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

export function WLClientEditForm({ client }: { client: ClientRow }) {
  const boundAction = updateClientAction.bind(null, client.id);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="businessName" className={labelClass}>
          事業者名 <span className="text-destructive">*</span>
        </label>
        <input
          id="businessName"
          name="businessName"
          required
          defaultValue={client.businessName}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>ステータス</span>
        <span
          className={[
            "inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium",
            client.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          ].join(" ")}
        >
          {client.status === "active" ? "アクティブ" : "停止中"}
        </span>
        <p className="text-xs text-muted-foreground">
          停止・復活はクライアント一覧から行ってください。
        </p>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link
          href="/wl/clients"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
