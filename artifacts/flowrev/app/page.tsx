export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center">
      <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
        Phase 1 / 土台構築
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        FlowRev
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        一人でも回るAI運営システム。Next.js 14 + Supabase の土台を構築しました。
      </p>
      <div className="mt-2 rounded-lg border border-border bg-card px-5 py-3 text-sm text-card-foreground">
        Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui 準備済み
      </div>
    </main>
  );
}
