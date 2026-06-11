"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectResult {
  total: number;
  updated: number;
  failed: number;
  errors: string[];
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; result: ProtectResult }
  | { kind: "error"; message: string };

export function ProtectAllVideosButton() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function handleClick() {
    const confirmed = window.confirm(
      "Cloudflare Stream 上の全動画に「署名付き URL 必須」を一括設定します。\n" +
        "この操作は冪等（再実行しても安全）ですが、動画数によっては完了まで数十秒かかる場合があります。\n\n" +
        "実行しますか？",
    );
    if (!confirmed) return;

    setState({ kind: "loading" });

    try {
      const res = await fetch("/api/admin/video/protect-all", {
        method: "POST",
      });

      const json = (await res.json()) as ProtectResult & { error?: string };

      if (!res.ok) {
        setState({ kind: "error", message: json.error ?? "一括保護に失敗しました。" });
        return;
      }

      setState({ kind: "success", result: json });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "通信エラーが発生しました。",
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">既存動画を一括保護</p>
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
          disabled={state.kind === "loading"}
          className="shrink-0"
        >
          {state.kind === "loading" ? (
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

      {state.kind === "success" && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <div className="flex items-center gap-2 font-medium mb-1">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            一括保護が完了しました
          </div>
          <ul className="flex flex-col gap-0.5 text-xs">
            <li>対象動画: <span className="font-mono">{state.result.total}</span> 件</li>
            <li>更新成功: <span className="font-mono">{state.result.updated}</span> 件</li>
            {state.result.failed > 0 && (
              <li className="text-red-700">
                更新失敗: <span className="font-mono">{state.result.failed}</span> 件
              </li>
            )}
          </ul>
          {state.result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-700 hover:underline">
                エラー詳細を表示
              </summary>
              <ul className="mt-1 flex flex-col gap-1 font-mono text-xs text-red-700 break-all">
                {state.result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {state.kind === "error" && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}
    </div>
  );
}
