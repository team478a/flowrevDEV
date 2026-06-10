import { getSessionProfile } from "@/features/auth/session";
import { DisplayNameForm } from "@/features/settings/components/display-name-form";
import { PasswordForm } from "@/features/settings/components/password-form";
import { LogoutButton } from "@/features/auth/components/logout-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "アカウント設定 | マイページ",
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

export default async function MySettingsPage() {
  const session = await getSessionProfile();

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">アカウント設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          プロフィールとパスワードを管理します。
        </p>
      </div>

      {/* アカウント情報 */}
      <Section
        title="アカウント情報"
        description="現在ログイン中のアカウントです。"
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-muted-foreground">メールアドレス</dt>
          <dd className="font-medium">{session?.email ?? "—"}</dd>
        </dl>
      </Section>

      {/* 表示名 */}
      <Section
        title="表示名"
        description="マイページに表示されるお名前を変更できます。"
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
            ログアウトするとセッションが終了します。
          </p>
          <div>
            <LogoutButton />
          </div>
        </div>
      </Section>
    </div>
  );
}
