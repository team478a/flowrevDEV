import Link from "next/link";

interface Props {
  currentLimit: number;
  buildUrl: (limit: number) => string;
}

const OPTIONS: { label: string; value: number }[] = [
  { label: "30件", value: 30 },
  { label: "60件", value: 60 },
  { label: "全期間", value: 0 },
];

export function ChartLimitSelector({ currentLimit, buildUrl }: Props) {
  return (
    <div className="flex items-center gap-1">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === currentLimit;
        return (
          <Link
            key={opt.value}
            href={buildUrl(opt.value)}
            className={[
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
