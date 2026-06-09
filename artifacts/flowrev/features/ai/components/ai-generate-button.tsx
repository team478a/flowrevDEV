"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiGenerateButtonProps {
  endpoint: string;
  buildPayload: () => Record<string, string>;
  onGenerated: (text: string) => void;
  disabled?: boolean;
}

export function AiGenerateButton({
  endpoint,
  buildPayload,
  onGenerated,
  disabled,
}: AiGenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "生成に失敗しました。");
        return;
      }
      if (data.text) onGenerated(data.text);
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={loading || disabled}
        className="self-start gap-1.5 text-violet-600 border-violet-300 hover:bg-violet-50"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {loading ? "生成中…" : "AI で生成"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
