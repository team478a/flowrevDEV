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
        "flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm transition-colors hover:bg-slate-50/80",
        warn ? "border-amber-300 bg-amber-50/60" : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div
          className={[
            "w-10 h-10 rounded-lg flex items-center justify-center",
            warn ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600",
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
      <div>
        <span
          className={[
            "text-2xl font-bold",
            warn ? "text-amber-700" : "text-slate-900",
          ].join(" ")}
        >
          {value.toLocaleString()}
        </span>
        {sub && (
          <div className="mt-1 text-xs text-slate-500">{sub}</div>
        )}
      </div>
    </Link>
  );
}
