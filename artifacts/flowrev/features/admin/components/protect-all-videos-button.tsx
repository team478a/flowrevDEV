"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectResult {
  total: number;
  updated: number;
  failed: number;
  errors: string[];
}

interface UnprotectedCount {
  unprotected: number;
  total: number;
}

type CountState =
  | { kind: "loading" }
  | { kind: "loaded"; data: UnprotectedCount }
  | { kind: "error" }
  | { kind: "unavailable" };

type ActionState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; result: ProtectResult }
  | { kind: "error"; message: string };

export function ProtectAllVideosButton() {
  const router = useRouter();
  const [countState, setCountState] = useState<CountState>({ kind: "loading" });
  const [actionState, setActionState] = useState<ActionState>({ kind: "idle" });

  const fetchCount = useCallback(async () => {
    setCountState({ kind: "loading" });
    try {
      const res = await fetch("/api/admin/video/unprotected-count");
      if (res.status === 503) {
        setCountState({ kind: "unavailable" });
        return;
      }
      if (!res.ok) {
        setCountState({ kind: "error" });
        return;
      }
      const json = (await res.json()) as UnprotectedCount;
      setCountState({ kind: "loaded", data: json });
    } catch {
      setCountState({ kind: "error" });
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  async function handleClick() {
    const confirmed = window.confirm(
      "Cloudflare Stream 上の全動画に「署名付き URL 必須」を一括設定します。\n" +
        "この操作は冪等（再実行しても安全）ですが、動画数によっては完了まで数十秒かかる場合があります。\n\n" +
        "実行しますか？",
    );
    if (!confirmed) return;

    setActionState({ kind: "loading" });

    try {
      const res = await fetch("/api/admin/video/protect-all", {
        method: "POST",
      });

      const json = (await res.json()) as ProtectResult & { error?: string };

      if (!res.ok) {
        setActionState({
          kind: "error",
          message: json.error ?? "一括保護に失敗しました。",
        });
        return;
      }

      setActionState({ kind: "success", result: json });
      await fetchCount();
      router.refresh();
    } catch (e) {
      setActionState({
        kind: "error",
        message: e instanceof Error ? e.message : "通信エラーが発生しました。",
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">既存動画を一括保護</p>
            <UnprotectedBadge state={countState} onRefresh={fetchCount} />
          </div>
          <p className="text-xs text-muted-foreground">
            この操作を実行以前にアップロードされた動画はビデオ ID のみで
            誰でも視聴できる状態です。ボタンを押すと全動画に
            「署名付き URL 必須」フラグを一括適用して保護します。
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleClick}
          disabled={actionState.kind === "loading"}
          className="shrink-0"
        >
          {actionState.kind === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中…
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              一括保護を実行
            </>
          )}
        </Button>
      </div>

      {actionState.kind === "success" && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <div className="flex items-center gap-2 font-medium mb-1">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            一括保護が完了しました
          </div>
          <ul className="flex flex-col gap-0.5 text-xs">
            <li>
              対象動画:{" "}
              <span className="font-mono">{actionState.result.total}</span> 件
            </li>
            <li>
              更新成功:{" "}
              <span className="font-mono">{actionState.result.updated}</span> 件
            </li>
            {actionState.result.failed > 0 && (
              <li className="text-red-700">
                更新失敗:{" "}
                <span className="font-mono">{actionState.result.failed}</span>{" "}
                件
              </li>
            )}
          </ul>
          {actionState.result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-700 hover:underline">
                エラー詳細を表示
              </summary>
              <ul className="mt-1 flex flex-col gap-1 font-mono text-xs text-red-700 break-all">
                {actionState.result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
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

function UnprotectedBadge({
  state,
  onRefresh,
}: {
  state: CountState;
  onRefresh: () => void;
}) {
  if (state.kind === "loading") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        確認中…
      </span>
    );
  }

  if (state.kind === "unavailable") {
    return null;
  }

  if (state.kind === "error") {
    return (
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/80"
      >
        <RefreshCw className="h-3 w-3" />
        再取得
      </button>
    );
  }

  const { unprotected } = state.data;

  if (unprotected === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        全件保護済み
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      <ShieldAlert className="h-3 w-3" />
      未保護: {unprotected} 件
    </span>
  );
}
