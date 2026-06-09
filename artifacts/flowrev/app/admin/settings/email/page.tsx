import Link from "next/link";
import { EmailSettingsForm } from "@/features/admin/components/email-settings-form";
import { getHqEmailSettingMasked } from "@/lib/repositories/email-settings";
import { requireSystemAdmin } from "@/features/admin/guard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "メール設定 | FlowRev",
};

export default async function EmailSettingsPage() {
  await requireSystemAdmin();
  const current = await getHqEmailSettingMasked();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 管理ダッシュボード
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          メール設定（Resend）
        </h1>
        <p className="text-sm text-muted-foreground">
          招待メールなどの送信に使う共通設定です。APIキーは暗号化して保存されます。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <EmailSettingsForm current={current} />
      </div>
    </main>
  );
}
