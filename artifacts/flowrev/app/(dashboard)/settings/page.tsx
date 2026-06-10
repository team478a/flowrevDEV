import { getSessionProfile } from "@/features/auth/session";
import { DisplayNameForm } from "@/features/settings/components/display-name-form";
import { PasswordForm } from "@/features/settings/components/password-form";
import { LogoutButton } from "@/features/auth/components/logout-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "設定 | FlowRev",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 pb-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const session = await getSessionProfile();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          アカウント情報を管理します。
        </p>
      </div>

      {/* アカウント情報 */}
      <Section
        title="アカウント情報"
        description="現在ログイン中のアカウント情報です。"
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-muted-foreground">メールアドレス</dt>
          <dd className="font-medium">{session?.email ?? "—"}</dd>
          <dt className="text-muted-foreground">ロール</dt>
          <dd className="font-medium">
            {session?.role === "client_owner"
              ? "クライアント管理者"
              : session?.role ?? "—"}
          </dd>
        </dl>
      </Section>

      {/* 表示名 */}
      <Section
        title="プロフィール"
        description="ダッシュボードに表示される名前を変更できます。"
      >
        <DisplayNameForm currentDisplayName={session?.displayName ?? null} />
      </Section>

      {/* パスワード */}
      <Section
        title="パスワード変更"
        description="新しいパスワードは8文字以上で設定してください。"
      >
        <PasswordForm />
      </Section>

      {/* ログアウト */}
      <Section title="ログアウト">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            ログアウトするとセッションが終了します。再度ログインが必要になります。
          </p>
          <div>
            <LogoutButton />
          </div>
        </div>
      </Section>
    </div>
  );
}
