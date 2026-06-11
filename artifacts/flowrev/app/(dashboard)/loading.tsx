export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 rounded-md bg-muted" />
        <div className="h-4 w-56 rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="h-3 w-16 rounded bg-muted mb-3" />
            <div className="h-8 w-12 rounded bg-muted mb-2" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="h-5 w-32 rounded bg-muted mb-4" />
        <div className="h-40 w-full rounded bg-muted" />
      </div>
    </div>
  );
}
