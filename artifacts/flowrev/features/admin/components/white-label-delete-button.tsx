"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWhiteLabelAction } from "../actions";

interface Props {
  id: string;
  brandName: string;
}

export function WhiteLabelDeleteButton({ id, brandName }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteWhiteLabelAction(id);
      if (result?.error) {
        setError(result.error);
        setConfirm(false);
      } else {
        router.refresh();
      }
    });
  }

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="inline-flex h-7 items-center rounded-md border border-destructive/30 bg-background px-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        削除
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">「{brandName}」を削除しますか？</span>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="inline-flex h-7 items-center rounded-md bg-destructive px-2 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
        >
          {isPending ? "削除中…" : "削除する"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirm(false)}
          className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-accent"
        >
          キャンセル
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
