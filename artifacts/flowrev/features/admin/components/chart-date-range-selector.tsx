"use client";

import {
  format,
  isAfter,
  isValid,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
} from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useRouter, useSearchParams } from "next/navigation";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ChartPreset = "7d" | "30d" | "all" | "custom";

const NON_CUSTOM_PRESETS: { label: string; value: ChartPreset }[] = [
  { label: "過去7日", value: "7d" },
  { label: "過去30日", value: "30d" },
  { label: "全期間", value: "all" },
];

function getCalendarPresets(): { label: string; range: DateRange }[] {
  const today = new Date();
  return [
    {
      label: "今月",
      range: { from: startOfMonth(today), to: today },
    },
    {
      label: "先月",
      range: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      },
    },
    {
      label: "過去3ヶ月",
      range: { from: startOfMonth(subMonths(today, 3)), to: today },
    },
    {
      label: "今四半期",
      range: { from: startOfQuarter(today), to: today },
    },
    {
      label: "前四半期",
      range: {
        from: startOfQuarter(subQuarters(today, 1)),
        to: endOfQuarter(subQuarters(today, 1)),
      },
    },
  ];
}

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
  const [open, setOpen] = useState(false);

  const initialFrom =
    currentFrom && isValid(parseISO(currentFrom))
      ? parseISO(currentFrom)
      : undefined;
  const initialTo =
    currentTo && isValid(parseISO(currentTo))
      ? parseISO(currentTo)
      : undefined;

  const [range, setRange] = useState<DateRange | undefined>(
    initialFrom ? { from: initialFrom, to: initialTo } : undefined
  );

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

  function handleApply() {
    if (!range?.from) return;
    const from = format(range.from, "yyyy-MM-dd");
    const to = range.to ? format(range.to, "yyyy-MM-dd") : from;
    setOpen(false);
    router.push(buildUrl("custom", from, to));
  }

  function handleCalendarPreset(preset: { label: string; range: DateRange }) {
    const from = format(preset.range.from!, "yyyy-MM-dd");
    const to = preset.range.to ? format(preset.range.to, "yyyy-MM-dd") : from;
    setRange(preset.range);
    setOpen(false);
    router.push(buildUrl("custom", from, to));
  }

  const rangeLabel = (() => {
    const from = range?.from
      ? format(range.from, "yyyy/MM/dd", { locale: ja })
      : null;
    const to = range?.to
      ? format(range.to, "yyyy/MM/dd", { locale: ja })
      : null;
    if (!from) return "期間を選択";
    if (!to || from === to) return from;
    return `${from} 〜 ${to}`;
  })();

  const calendarPresets = getCalendarPresets();

  const calendarPopover = (
    <PopoverContent align="end" className="w-auto p-0">
      <div className="flex">
        <div className="flex flex-col gap-1 border-r p-3 min-w-[100px]">
          <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            クイック選択
          </p>
          {calendarPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleCalendarPreset(preset)}
              className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            locale={ja}
            disabled={(date) => isAfter(date, new Date())}
          />
          <div className="flex justify-end gap-2 border-t px-4 py-3">
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleApply}
              disabled={!range?.from}
              className="rounded-md border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              適用
            </button>
          </div>
        </div>
      </div>
    </PopoverContent>
  );

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-1">
        {NON_CUSTOM_PRESETS.map((opt) => {
          const isActive = opt.value === currentPreset;
          return (
            <button
              key={opt.value}
              onClick={() => router.push(buildUrl(opt.value))}
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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className={[
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                currentPreset === "custom"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              カスタム
            </button>
          </PopoverTrigger>
          {calendarPopover}
        </Popover>
      </div>

      {currentPreset === "custom" && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{rangeLabel}</span>
        </button>
      )}
    </div>
  );
}
