"use client";

import { cn } from "@/lib/utils";

export const COLOR_THEMES = [
  { id: "blue",   label: "ブルー",   primary: "#2563eb", bg: "#eff6ff", accent: "#1d4ed8" },
  { id: "green",  label: "グリーン", primary: "#16a34a", bg: "#f0fdf4", accent: "#15803d" },
  { id: "red",    label: "レッド",   primary: "#dc2626", bg: "#fef2f2", accent: "#b91c1c" },
  { id: "orange", label: "オレンジ", primary: "#ea580c", bg: "#fff7ed", accent: "#c2410c" },
  { id: "purple", label: "パープル", primary: "#7c3aed", bg: "#f5f3ff", accent: "#6d28d9" },
  { id: "dark",   label: "ダーク",   primary: "#1f2937", bg: "#f8fafc", accent: "#111827" },
] as const;

export type ColorThemeId = (typeof COLOR_THEMES)[number]["id"];

export const DESIGN_STYLES = [
  { id: "modern",   label: "モダン" },
  { id: "natural",  label: "ナチュラル" },
  { id: "luxury",   label: "高級感" },
  { id: "pop",      label: "ポップ" },
  { id: "business", label: "ビジネス" },
] as const;

export type DesignStyleId = (typeof DESIGN_STYLES)[number]["id"];

interface LpDesignPickerProps {
  colorTheme: ColorThemeId;
  designStyle: DesignStyleId;
  onColorChange: (id: ColorThemeId) => void;
  onStyleChange: (id: DesignStyleId) => void;
}

export function LpDesignPicker({
  colorTheme,
  designStyle,
  onColorChange,
  onStyleChange,
}: LpDesignPickerProps) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        デザイン設定
      </p>

      {/* カラーテーマ */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">カラーテーマ</span>
        <div className="flex flex-wrap gap-2">
          {COLOR_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onColorChange(t.id)}
              title={t.label}
              className={cn(
                "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all",
                colorTheme === t.id
                  ? "border-gray-700 shadow-md ring-2 ring-offset-1"
                  : "border-transparent hover:border-gray-300",
              )}
              style={{
                backgroundColor: t.bg,
                color: t.primary,
              }}
            >
              <span
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: t.primary }}
              />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* デザインスタイル */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">デザインスタイル</span>
        <div className="flex flex-wrap gap-2">
          {DESIGN_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStyleChange(s.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                designStyle === s.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background hover:border-primary/50 hover:bg-primary/5 text-muted-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
