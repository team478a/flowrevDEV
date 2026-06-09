"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CompleteButtonProps {
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
}

export function CompleteButton({
  lessonId,
  courseId,
  isCompleted,
}: CompleteButtonProps) {
  const router = useRouter();
  const [done, setDone] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleComplete() {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/my/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, courseId }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok || data.error) {
          setError(data.error ?? "更新に失敗しました。");
          return;
        }
        setDone(true);
        router.refresh();
      } catch {
        setError("ネットワークエラーが発生しました。");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={done ? "default" : "outline"}
        size="sm"
        onClick={handleComplete}
        disabled={isPending || done}
        className="gap-2"
      >
        {done ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            完了済み
          </>
        ) : (
          <>
            <Circle className="h-4 w-4" />
            {isPending ? "更新中…" : "✅ 完了にする"}
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
