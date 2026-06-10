"use client";

import { useFormState } from "react-dom";
import { toggleWhiteLabelStatusAction, type ToggleWLStatusState } from "../actions";

const initialState: ToggleWLStatusState = { error: null };

interface Props {
  id: string;
  brandName: string;
  currentStatus: string | null;
}

export function WhiteLabelToggleStatusButton({ id, brandName, currentStatus }: Props) {
  const nextStatus = currentStatus === "active" ? "suspended" : "active";
  const [state, formAction] = useFormState(toggleWhiteLabelStatusAction, initialState);

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value={nextStatus} />
        <button
          type="submit"
          className={[
            "inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium transition-colors",
            currentStatus === "active"
              ? "border-amber-300 bg-background text-amber-700 hover:bg-amber-50"
              : "border-emerald-300 bg-background text-emerald-700 hover:bg-emerald-50",
          ].join(" ")}
        >
          {currentStatus === "active" ? "停止" : "復活"}
        </button>
      </form>
      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}
