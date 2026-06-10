"use client";

import Link from "next/link";
import { Sparkles, Code2 } from "lucide-react";

export function LpCreateModeSelector() {
  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <p className="text-sm text-muted-foreground">
          作成方法を選んでください
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* かんたん作成 */}
        <Link
          href="/lp/new?mode=easy"
          className="group flex flex-col gap-4 rounded-xl border-2 border-primary/40 bg-primary/5 p-6 hover:border-primary hover:bg-primary/10 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/15 p-2.5">
              <Sparkles className="h-5 w-5 text-primary" />
            </span>
            <span className="text-xs font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
              おすすめ
            </span>
          </div>
          <div>
            <p className="font-bold text-base">かんたん作成</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              目的を入力するだけでAIがLP全体を自動生成します。HTMLの知識は不要です。
            </p>
          </div>
        </Link>

        {/* 自由編集 */}
        <Link
          href="/lp/new?mode=advanced"
          className="group flex flex-col gap-4 rounded-xl border-2 border-border bg-card p-6 hover:border-foreground/30 hover:bg-accent/40 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-muted p-2.5">
              <Code2 className="h-5 w-5 text-muted-foreground" />
            </span>
          </div>
          <div>
            <p className="font-bold text-base">自由編集</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              HTMLエディターとリアルタイムプレビューを使って細かく編集できます。
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
