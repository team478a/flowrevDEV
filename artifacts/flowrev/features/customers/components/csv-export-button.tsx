"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CsvExportButtonProps {
  inactiveOnly?: boolean;
  label?: string;
  disabled?: boolean;
}

export function CsvExportButton({
  inactiveOnly = false,
  label,
  disabled = false,
}: CsvExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const url = inactiveOnly
        ? "/api/customers/export?inactive=1"
        : "/api/customers/export";
      const res = await fetch(url);
      if (!res.ok) {
        setError("エクスポートに失敗しました。");
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "customers.csv";

      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  const defaultLabel = inactiveOnly ? "未アクションCSV" : "CSV出力";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={loading || disabled}
        className="gap-1.5"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {loading ? "作成中…" : (label ?? defaultLabel)}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
