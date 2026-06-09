import { LogoutButton } from "./logout-button";

interface PlaceholderHomeProps {
  title: string;
  role: string | null;
  email: string | null;
  displayName: string | null;
}

/**
 * 各ロールのホーム画面の暫定プレースホルダ。
 * 認証フローの動作確認用。各機能は後続タスクで実装する。
 */
export function PlaceholderHome({
  title,
  role,
  email,
  displayName,
}: PlaceholderHomeProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-primary">FlowRev</span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        <LogoutButton />
      </div>

      <dl className="grid gap-3 rounded-lg border border-border bg-card p-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">表示名</dt>
          <dd className="font-medium text-card-foreground">
            {displayName ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">メール</dt>
          <dd className="font-medium text-card-foreground">{email ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">ロール</dt>
          <dd className="font-mono text-xs font-medium text-card-foreground">
            {role ?? "—"}
          </dd>
        </div>
      </dl>

      <p className="text-sm text-muted-foreground">
        認証と権限ガードが有効です。各機能は後続タスクで実装します。
      </p>
    </main>
  );
}
