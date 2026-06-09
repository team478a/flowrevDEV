import Link from "next/link";
import { getValidInvitationByToken } from "@/lib/repositories/invitations";
import { RegisterForm } from "@/features/invitations/components/register-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "アカウント登録 | FlowRev",
};

function Shell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            FlowRev
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token?.trim() ?? "";
  const invitation = token ? await getValidInvitationByToken(token) : null;

  if (!invitation) {
    return (
      <Shell
        title="登録できません"
        description="招待リンクが無効です"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            招待が見つからないか、有効期限が切れています。
            お手数ですが、招待者に再発行を依頼してください。
          </p>
          <Link
            href="/login"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            ログイン画面へ
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title="アカウント登録"
      description={`${invitation.clientName} の管理アカウントを作成します`}
    >
      <RegisterForm token={token} email={invitation.email} />
    </Shell>
  );
}
