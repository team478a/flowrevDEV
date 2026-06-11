import type { ReactNode } from "react";

interface StepProps {
  n: number;
  children: ReactNode;
}

export function Step({ n, children }: StepProps) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
        {n}
      </span>
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  );
}

interface TipProps {
  children: ReactNode;
  type?: "info" | "warn";
}

export function Tip({ children, type = "info" }: TipProps) {
  const colors =
    type === "warn"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-blue-50 border-blue-200 text-blue-800";
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${colors}`}>
      <span className="font-semibold mr-1">{type === "warn" ? "⚠️ 注意" : "💡 ポイント"}</span>
      {children}
    </div>
  );
}

interface SectionProps {
  id: string;
  title: string;
  icon: string;
  children: ReactNode;
}

export function ManualSection({ id, title, icon, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

interface SubSectionProps {
  title: string;
  children: ReactNode;
}

export function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground mb-3">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
