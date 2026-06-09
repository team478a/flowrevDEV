"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { deleteLpAction } from "@/features/lp/actions";

interface DeleteLpButtonProps {
  lpId: string;
  lpTitle: string;
  deleteAction: typeof deleteLpAction;
}

export function DeleteLpButton({
  lpId,
  lpTitle,
  deleteAction,
}: DeleteLpButtonProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAction(lpId);
      if (result?.error) {
        setError(result.error);
        setConfirm(false);
      } else {
        router.push("/lp");
      }
    });
  }

  if (!confirm) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10 border-destructive/30"
        onClick={() => setConfirm(true)}
      >
        <Trash2 className="h-4 w-4 mr-1.5" />
        削除
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          「{lpTitle}」を削除しますか？
        </span>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={handleDelete}
        >
          {isPending ? "削除中…" : "削除する"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => setConfirm(false)}
        >
          キャンセル
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
