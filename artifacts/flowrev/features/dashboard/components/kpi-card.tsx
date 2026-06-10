import Link from "next/link";

export interface KpiCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: React.ReactNode;
  warn?: boolean;
}

export function KpiCard({ href, icon, label, value, sub, warn }: KpiCardProps) {
  return (
    <Link
      href={href}
      className={[
        "flex flex-col gap-2 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/50",
        warn ? "border-amber-300 bg-amber-50/60" : "border-border",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className={warn ? "text-amber-500" : "text-muted-foreground"}>
          {icon}
        </span>
      </div>
      <span
        className={[
          "text-3xl font-bold",
          warn ? "text-amber-700" : "text-foreground",
        ].join(" ")}
      >
        {value.toLocaleString()}
      </span>
      {sub && (
        <span className="text-xs text-muted-foreground">{sub}</span>
      )}
    </Link>
  );
}
