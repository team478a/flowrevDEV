"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Code2, ExternalLink } from "lucide-react";

interface LpHtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  id: string;
  rows?: number;
}

/** マークダウンのコードフェンス（```html ... ```）を取り除く */
function stripCodeFence(html: string): string {
  const match = html.match(/^```[\w]*\r?\n([\s\S]*?)\r?\n```\s*$/);
  if (match) return match[1].trim();
  return html
    .replace(/^```[\w]*\r?\n?/, "")
    .replace(/\r?\n```\s*$/, "")
    .trim();
}

/**
 * プレビュー用 HTML ドキュメントを構築する。
 * - HTML に <style> タグが含まれる場合は最小 CSS のみラップ（競合防止）
 * - 含まれない場合は読みやすい基本スタイルをラップ
 */
function buildPreviewDoc(rawHtml: string): string {
  const html = stripCodeFence(rawHtml);
  const hasStyle = /<style[\s>]/i.test(html);

  const baseCss = hasStyle
    ? "*,*::before,*::after{box-sizing:border-box;}body{margin:0;}img{max-width:100%;height:auto;}"
    : `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    margin:0;padding:24px;color:#1a1a1a;line-height:1.7;font-size:15px;}
    h1,h2,h3{line-height:1.3;margin-top:1.5em;margin-bottom:.5em;}
    h1{font-size:1.8em;}h2{font-size:1.4em;}h3{font-size:1.2em;}
    p{margin:0 0 1em;}img{max-width:100%;height:auto;}
    a{color:#3b82f6;}ul,ol{padding-left:1.5em;}`;

  return `<!DOCTYPE html><html lang="ja"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${baseCss}</style>
</head><body>${html}</body></html>`;
}

/** 現在の HTML を新しいタブで開く（Blob URL 経由） */
function openPreviewInNewTab(rawHtml: string) {
  const doc = buildPreviewDoc(rawHtml);
  const blob = new Blob([doc], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) return;
  // ウィンドウがロードした後に URL を解放
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

type Tab = "edit" | "preview";

export function LpHtmlEditor({
  value,
  onChange,
  name,
  id,
  rows = 16,
}: LpHtmlEditorProps) {
  const [tab, setTab] = useState<Tab>("edit");
  const [previewDoc, setPreviewDoc] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPreviewDoc(buildPreviewDoc(value)), 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value]);

  const handleOpenNewTab = useCallback(() => {
    openPreviewInNewTab(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      {/* モバイル：タブ切替 */}
      <div className="flex items-center gap-1 lg:hidden">
        {(["edit", "preview"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            ].join(" ")}
          >
            {t === "edit"
              ? <><Code2 className="h-3.5 w-3.5" />HTMLを編集</>
              : <><Eye className="h-3.5 w-3.5" />プレビュー</>}
          </button>
        ))}
      </div>

      {/* デスクトップ：2カラム / モバイル：タブで切替 */}
      <div className="grid lg:grid-cols-2 gap-3">
        {/* エディター */}
        <div className={tab !== "edit" ? "hidden lg:flex lg:flex-col" : "flex flex-col"}>
          <p className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
            <Code2 className="h-3 w-3" /> HTMLを編集
          </p>
          <Textarea
            id={id}
            name={name}
            placeholder={"<h1>見出し</h1>\n<p>本文をここに入力...</p>"}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm resize-none flex-1"
          />
        </div>

        {/* プレビュー */}
        <div className={tab !== "preview" ? "hidden lg:flex lg:flex-col" : "flex flex-col"}>
          <div className="hidden lg:flex items-center justify-between mb-1.5">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" /> プレビュー（リアルタイム）
            </p>
            {value.trim() && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                title="新しいタブでフルサイズのプレビューを開く"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                新しいタブで開く
              </button>
            )}
          </div>
          {/* モバイル用：プレビュータブ表示時に「新しいタブで開く」を表示 */}
          {tab === "preview" && value.trim() && (
            <div className="flex lg:hidden justify-end mb-1.5">
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                新しいタブで開く
              </button>
            </div>
          )}
          <div className="rounded-md border border-border overflow-hidden bg-white" style={{ minHeight: "384px" }}>
            {previewDoc ? (
              <iframe
                srcDoc={previewDoc}
                className="w-full h-full"
                style={{ minHeight: "384px" }}
                sandbox="allow-same-origin"
                title="LPプレビュー"
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-sm text-muted-foreground">
                HTMLを入力するとプレビューが表示されます
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
