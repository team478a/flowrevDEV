"use client";

import { useRef, useState } from "react";
import { ImagePlus, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LpImageToolbarProps {
  /** 生成・アップロードされた <img> タグを挿入するコールバック */
  onInsert: (imgHtml: string) => void;
}

type Mode = "idle" | "ai-form" | "loading-upload" | "loading-ai";

export function LpImageToolbar({ onInsert }: LpImageToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [aiPrompt, setAiPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function makeImgTag(url: string, alt = "画像") {
    return `<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:16px 0;">`;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMode("loading-upload");
    setError(null);
    e.target.value = "";
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/lp/upload-image", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "アップロードに失敗しました。");
      onInsert(makeImgTag(data.url, file.name.replace(/\.[^.]+$/, "")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    } finally {
      setMode("idle");
    }
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setMode("loading-ai");
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "生成に失敗しました。");
      onInsert(makeImgTag(data.url, aiPrompt.slice(0, 40)));
      setAiPrompt("");
      setMode("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
      setMode("ai-form");
    }
  }

  const isLoading = mode === "loading-upload" || mode === "loading-ai";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">画像を挿入：</span>

        {/* アップロードボタン */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium border border-border bg-background hover:bg-accent transition-colors disabled:opacity-50"
        >
          {mode === "loading-upload"
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <ImagePlus className="h-3.5 w-3.5" />}
          画像をアップロード
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* AI生成ボタン */}
        {mode !== "ai-form" ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => { setMode("ai-form"); setError(null); }}
            className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            {mode === "loading-ai"
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Sparkles className="h-3.5 w-3.5" />}
            AIで画像を生成
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setMode("idle"); setError(null); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            キャンセル
          </button>
        )}
      </div>

      {/* AI 画像生成フォーム */}
      {mode === "ai-form" && (
        <div className="flex items-center gap-2">
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="例：明るいオフィスで笑顔のビジネスマン"
            className="h-8 text-xs flex-1"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleAiGenerate(); } }}
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={!aiPrompt.trim()}
            onClick={handleAiGenerate}
          >
            <Sparkles className="h-3.5 w-3.5" />
            生成する
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{error}</p>
      )}
    </div>
  );
}
