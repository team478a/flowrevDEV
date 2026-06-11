"use client";

import { useState } from "react";
import {
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckResult {
  ok: boolean;
  unprotected: number;
  total: number;
  notified: boolean;
  message?: string;
}

type ActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; result: CheckResult }
  | { kind: "error"; message: string };

export function CheckUnprotectedVideosButton() {
  const [actionState, setActionState] = useState<ActionState>({ kind: "idle" });

  async function handleClick() {
    setActionState({ kind: "loading" });

    try {
      const res = await fetch("/api/admin/cron/check-unprotected-videos", {
        method: "POST",
      });

      const json = (await res.json()) as CheckResult & { error?: string };

      if (!res.ok) {
        setActionState({
          kind: "error",
          message: json.error ?? json.message ?? "チェックに失敗しました。",
        });
        return;
      }

      setActionState({ kind: "success", result: json });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e) {
      setActionState({
        kind: "error",
        message: e instanceof Error ? e.message : "通信エラーが発生しました。",
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Cron による自動チェックを待たず、今すぐ未保護動画の有無を確認できます。
          結果はチェック履歴に記録されます。
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={handleClick}
          disabled={actionState.kind === "loading" || actionState.kind === "success"}
          className="shrink-0"
        >
          {actionState.kind === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              チェック中…
            </>
          ) : (
            <>
              <SearchCheck className="mr-2 h-4 w-4" />
              今すぐチェック
            </>
          )}
        </Button>
      </div>

      {actionState.kind === "success" && (
        <div
          className={[
            "rounded-md border px-4 py-3 text-sm",
            actionState.result.unprotected > 0
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-green-200 bg-green-50 text-green-800",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 font-medium mb-1">
            {actionState.result.unprotected > 0 ? (
              <ShieldAlert className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            チェック完了
          </div>
          <ul className="flex flex-col gap-0.5 text-xs">
            <li>
              合計動画数:{" "}
              <span className="font-mono">{actionState.result.total}</span> 件
            </li>
            <li>
              未保護動画:{" "}
              <span className="font-mono font-medium">
                {actionState.result.unprotected}
              </span>{" "}
              件
              {actionState.result.unprotected === 0 && (
                <span className="ml-1 inline-flex items-center gap-0.5">
                  <ShieldCheck className="h-3 w-3" />
                  全件保護済み
                </span>
              )}
            </li>
            {actionState.result.notified && (
              <li>アラートメールを送信しました。</li>
            )}
          </ul>
          {actionState.result.message && (
            <p className="mt-1 text-xs opacity-80">{actionState.result.message}</p>
          )}
          <p className="mt-2 text-xs opacity-70">ページを更新しています…</p>
        </div>
      )}

      {actionState.kind === "error" && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionState.message}</span>
        </div>
      )}
    </div>
  );
}
