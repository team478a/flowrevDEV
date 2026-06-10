"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { toggleClientStatusAction, type ClientActionState } from "../actions";

const initialState: ClientActionState = { error: null };

interface Props {
  id: string;
  businessName: string;
  status: string;
}

export function WLClientRowActions({ id, businessName, status }: Props) {
  const nextStatus = status === "active" ? "suspended" : "active";
  const [state, formAction] = useFormState(toggleClientStatusAction, initialState);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Link
          href={`/wl/clients/${id}/edit`}
          className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-accent"
        >
          編集
        </Link>

        <form action={formAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={nextStatus} />
          <button
            type="submit"
            className={[
              "inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium transition-colors",
              status === "active"
                ? "border-amber-300 bg-background text-amber-700 hover:bg-amber-50"
                : "border-emerald-300 bg-background text-emerald-700 hover:bg-emerald-50",
            ].join(" ")}
          >
            {status === "active" ? "停止" : "復活"}
          </button>
        </form>
      </div>
      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}
