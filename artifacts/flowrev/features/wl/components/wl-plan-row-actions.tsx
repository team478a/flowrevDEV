"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { deleteWLPlanAction, type WLPlanActionState } from "../actions";

const initialState: WLPlanActionState = { error: null };

interface Props {
  id: string;
  name: string;
}

export function WLPlanRowActions({ id, name }: Props) {
  const [state, formAction] = useFormState(deleteWLPlanAction, initialState);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`「${name}」を削除しますか？この操作は取り消せません。`)) {
      e.preventDefault();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Link
          href={`/wl/plans/${id}/edit`}
          className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-accent"
        >
          編集
        </Link>

        <form action={formAction} onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="inline-flex h-7 items-center rounded-md border border-red-200 bg-background px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            削除
          </button>
        </form>
      </div>
      {state.error && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}
