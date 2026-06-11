"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { VideoCheckLogChartPoint } from "@/lib/repositories/video-check-logs";

interface Props {
  data: VideoCheckLogChartPoint[];
}

interface DotProps {
  cx?: number;
  cy?: number;
  value?: number;
}

function UnprotectedDot({ cx, cy, value }: DotProps) {
  if (!value || value === 0 || cx === undefined || cy === undefined) return null;
  const color = value >= 3 ? "#ef4444" : "#f97316";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#ffffff"
      strokeWidth={1.5}
    />
  );
}

interface LegendPayloadItem {
  value: string;
  color: string;
  type?: string;
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[];
  hasUnprotected: boolean;
}

function CustomLegend({ payload, hasUnprotected }: CustomLegendProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 text-[11px]">
      {payload?.map((entry) => (
        <span key={entry.value} className="flex items-center gap-1">
          <svg width="8" height="8" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" fill={entry.color} />
          </svg>
          <span style={{ color: "hsl(var(--foreground))" }}>{entry.value}</span>
        </span>
      ))}
      {hasUnprotected && (
        <span className="flex items-center gap-1 text-orange-500 font-medium">
          <span>⚠</span>
          <span>未保護あり</span>
        </span>
      )}
    </div>
  );
}

export function VideoCheckTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        グラフを表示するデータがまだありません。
      </p>
    );
  }

  const hasUnprotected = data.some((d) => d.unprotected > 0);

  return (
    <div>
      {hasUnprotected && (
        <div className="flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs text-orange-700 mb-2 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400">
          <span className="text-sm">⚠</span>
          <span>未保護の動画が検出された期間があります。赤・オレンジの点を確認してください。</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            content={(props: { payload?: LegendPayloadItem[] }) => (
              <CustomLegend
                payload={props.payload}
                hasUnprotected={hasUnprotected}
              />
            )}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="合計"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="unprotected"
            name="未保護"
            stroke="#f97316"
            strokeWidth={2}
            dot={<UnprotectedDot />}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
