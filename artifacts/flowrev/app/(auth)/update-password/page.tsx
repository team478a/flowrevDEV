import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";

export const metadata = {
  title: "新しいパスワードを設定 | FlowRev",
};

export default function UpdatePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            FlowRev
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            新しいパスワードを設定
          </h1>
          <p className="text-sm text-muted-foreground">
            8文字以上の新しいパスワードを入力してください。
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <UpdatePasswordForm />
        </div>
      </div>
    </main>
  );
}
