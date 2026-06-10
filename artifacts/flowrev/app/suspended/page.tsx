import Link from "next/link";

export const metadata = {
  title: "アカウント停止中 | FlowRev",
};

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 shadow-sm text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            アカウントが停止されています
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            このアカウントは現在利用停止中です。<br />
            再開をご希望の場合は、管理者にお問い合わせください。
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          ログイン画面に戻る
        </Link>
      </div>
    </div>
  );
}
