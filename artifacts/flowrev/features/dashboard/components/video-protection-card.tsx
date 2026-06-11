"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";

type VideoProtectionState =
  | { kind: "unconfigured" }
  | { kind: "error" }
  | { kind: "ok"; unprotected: number; total: number };

interface VideoProtectionCardProps {
  initialState: VideoProtectionState;
}

export function VideoProtectionCard({ initialState }: VideoProtectionCardProps) {
  const [state, setState] = useState<VideoProtectionState>(initialState);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/video/unprotected-count");
      if (res.status === 503) {
        setState({ kind: "unconfigured" });
      } else if (!res.ok) {
        setState({ kind: "error" });
      } else {
        const data = await res.json();
        setState({ kind: "ok", unprotected: data.unprotected, total: data.total });
      }
    } catch {
      setState({ kind: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshButton = (colorClass: string) => (
    <button
      onClick={refresh}
      disabled={loading}
      className={[
        "mt-2 inline-flex items-center gap-1 text-xs font-medium transition-opacity",
        loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-70",
        colorClass,
      ].join(" ")}
      aria-label="件数を更新"
    >
      <RefreshCw className={["h-3 w-3", loading ? "animate-spin" : ""].join(" ")} />
      更新
    </button>
  );

  if (state.kind === "unconfigured") {
    return (
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          動画保護
        </span>
        <span className="text-sm text-muted-foreground mt-1">未設定</span>
        <Link
          href="/admin/settings/video"
          className="mt-2 text-xs text-muted-foreground underline hover:opacity-70"
        >
          設定する →
        </Link>
        {refreshButton("text-muted-foreground")}
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          動画保護
        </span>
        <span className="text-sm text-red-600 mt-1">取得エラー</span>
        <Link
          href="/admin/settings/video"
          className="mt-2 text-xs text-muted-foreground underline hover:opacity-70"
        >
          設定を確認 →
        </Link>
        {refreshButton("text-red-500")}
      </div>
    );
  }

  const { unprotected, total } = state;
  const allProtected = unprotected === 0;

  return (
    <div
      className={[
        "flex flex-col gap-1 rounded-xl border p-5 shadow-sm",
        allProtected
          ? "border-green-200 bg-green-50"
          : "border-amber-200 bg-amber-50",
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5">
        {allProtected ? (
          <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
        ) : (
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        )}
        <span
          className={[
            "text-xs font-medium uppercase tracking-wide",
            allProtected ? "text-green-700" : "text-amber-700",
          ].join(" ")}
        >
          動画保護
        </span>
      </div>
      <span
        className={[
          "text-3xl font-bold",
          allProtected ? "text-green-700" : "text-amber-700",
        ].join(" ")}
      >
        {allProtected ? "全件保護済み" : `未保護 ${unprotected} 件`}
      </span>
      <Link
        href="/admin/settings/video"
        className={[
          "text-xs mt-0.5 hover:opacity-70",
          allProtected ? "text-green-600" : "text-amber-600",
        ].join(" ")}
      >
        {total} 件中 {total - unprotected} 件保護済み・設定を見る →
      </Link>
      {refreshButton(allProtected ? "text-green-600" : "text-amber-600")}
    </div>
  );
}
