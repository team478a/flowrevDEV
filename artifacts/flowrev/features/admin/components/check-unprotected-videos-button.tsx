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

interface ProtectResult {
  total: number;
  updated: number;
  failed: number;
  errors: string[];
}

type ActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; result: CheckResult }
  | { kind: "error"; message: string };

type ProtectState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; result: ProtectResult }
  | { kind: "error"; message: string };

export function CheckUnprotectedVideosButton() {
  const [actionState, setActionState] = useState<ActionState>({ kind: "idle" });
  const [protectState, setProtectState] = useState<ProtectState>({ kind: "idle" });

  async function handleClick() {
    setActionState({ kind: "loading" });
    setProtectState({ kind: "idle" });

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

      if (json.unprotected === 0) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (e) {
      setActionState({
        kind: "error",
        message: e instanceof Error ? e.message : "通信エラーが発生しました。",
      });
    }
  }

  async function handleProtectAll(unprotectedCount: number) {
    const confirmed = window.confirm(
      `未保護動画 ${unprotectedCount} 件に「署名付き URL 必須」を一括設定します。\n` +
        "この操作は冪等（再実行しても安全）ですが、動画数によっては完了まで数十秒かかる場合があります。\n\n" +
        "実行しますか？",
    );
    if (!confirmed) return;

    setProtectState({ kind: "loading" });

    try {
      const res = await fetch("/api/admin/video/protect-all", {
        method: "POST",
      });

      const json = (await res.json()) as ProtectResult & { error?: string };

      if (!res.ok) {
        setProtectState({
          kind: "error",
          message: json.error ?? "一括保護に失敗しました。",
        });
        return;
      }

      setProtectState({ kind: "success", result: json });
    } catch (e) {
      setProtectState({
        kind: "error",
        message: e instanceof Error ? e.message : "通信エラーが発生しました。",
      });
    }
  }

  function scrollToProtectSection() {
    const el = document.getElementById("protect-all-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-green-200 bg-green-50 text-green-800",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 font-medium mb-2">
            {actionState.result.unprotected > 0 ? (
              <ShieldAlert className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            チェック完了
          </div>
          <ul className="flex flex-col gap-0.5 text-xs mb-2">
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
            <p className="text-xs opacity-80 mb-2">{actionState.result.message}</p>
          )}

          {actionState.result.unprotected > 0 && protectState.kind === "idle" && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleProtectAll(actionState.result.unprotected)}
                className="bg-amber-600 hover:bg-amber-700 text-white border-0"
              >
                <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                一括保護を実行する（{actionState.result.unprotected} 件）
              </Button>
              <button
                type="button"
                onClick={scrollToProtectSection}
                className="text-xs underline opacity-60 hover:opacity-100"
              >
                ページ下部の保護セクションへ移動
              </button>
            </div>
          )}

          {actionState.result.unprotected === 0 && (
            <p className="text-xs opacity-70">ページを更新しています…</p>
          )}
        </div>
      )}

      {protectState.kind === "loading" && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          一括保護を実行中…動画数によっては数十秒かかる場合があります。
        </div>
      )}

      {protectState.kind === "success" && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <div className="flex items-center gap-2 font-medium mb-1">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            一括保護が完了しました
          </div>
          <ul className="flex flex-col gap-0.5 text-xs">
            <li>
              対象動画:{" "}
              <span className="font-mono">{protectState.result.total}</span> 件
            </li>
            <li>
              更新成功:{" "}
              <span className="font-mono">{protectState.result.updated}</span> 件
            </li>
            {protectState.result.failed > 0 && (
              <li className="text-red-700">
                更新失敗:{" "}
                <span className="font-mono">{protectState.result.failed}</span> 件
              </li>
            )}
          </ul>
          {protectState.result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-700 hover:underline">
                エラー詳細を表示
              </summary>
              <ul className="mt-1 flex flex-col gap-1 font-mono text-xs text-red-700 break-all">
                {protectState.result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {protectState.kind === "error" && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{protectState.message}</span>
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
