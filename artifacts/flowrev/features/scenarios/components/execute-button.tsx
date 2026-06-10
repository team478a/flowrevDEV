"use client";

import { useState, useTransition } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExecuteResult {
  sent: number;
  failed: number;
  message?: string;
}

/**
 * シナリオのテスト実行ボタン。
 * force=true で delay_days を無視して pending ログを即時送信する。
 */
export function ExecuteButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExecute() {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const res = await fetch("/api/admin/scenarios/execute?force=true", {
          method: "POST",
        });
        const data = (await res.json()) as {
          ok?: boolean;
          sent?: number;
          failed?: number;
          error?: string;
          message?: string;
        };
        if (!res.ok || data.error) {
          setError(data.error ?? "実行に失敗しました。");
          return;
        }
        setResult({
          sent: data.sent ?? 0,
          failed: data.failed ?? 0,
          message: data.message,
        });
      } catch {
        setError("ネットワークエラーが発生しました。");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExecute}
        disabled={isPending}
        className="gap-2 w-fit"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {isPending ? "実行中…" : "▶ テスト実行（即時）"}
      </Button>
      {result?.message && (
        <p className="text-xs text-muted-foreground">{result.message}</p>
      )}
      {result && !result.message && (
        <p className="text-xs text-green-600">
          完了：送信 {result.sent} 件 / 失敗 {result.failed} 件
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
