"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type ChartPreset = "7d" | "30d" | "all" | "custom";

const PRESETS: { label: string; value: ChartPreset }[] = [
  { label: "過去7日", value: "7d" },
  { label: "過去30日", value: "30d" },
  { label: "全期間", value: "all" },
  { label: "カスタム", value: "custom" },
];

interface Props {
  currentPreset: ChartPreset;
  currentFrom: string;
  currentTo: string;
}

export function ChartDateRangeSelector({
  currentPreset,
  currentFrom,
  currentTo,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customFrom, setCustomFrom] = useState(currentFrom);
  const [customTo, setCustomTo] = useState(currentTo);

  function buildUrl(preset: ChartPreset, from = "", to = ""): string {
    const p = new URLSearchParams(searchParams.toString());
    p.set("chartPreset", preset);
    p.delete("chartFrom");
    p.delete("chartTo");
    if (preset === "custom") {
      if (from) p.set("chartFrom", from);
      if (to) p.set("chartTo", to);
    }
    p.delete("chartLimit");
    return `?${p.toString()}`;
  }

  function handlePresetClick(preset: ChartPreset) {
    if (preset !== "custom") {
      router.push(buildUrl(preset));
    } else {
      router.push(buildUrl("custom", customFrom, customTo));
    }
  }

  function handleApply() {
    router.push(buildUrl("custom", customFrom, customTo));
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-1">
        {PRESETS.map((opt) => {
          const isActive = opt.value === currentPreset;
          return (
            <button
              key={opt.value}
              onClick={() => handlePresetClick(opt.value)}
              className={[
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {currentPreset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">〜</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleApply}
            className="rounded-md border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            適用
          </button>
        </div>
      )}
    </div>
  );
}
