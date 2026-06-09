import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "ログイン | FlowRev",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            FlowRev
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ログイン
          </h1>
          <p className="text-sm text-muted-foreground">
            アカウント情報を入力してください
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
