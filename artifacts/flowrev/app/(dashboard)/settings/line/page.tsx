import { getSessionProfile } from "@/features/auth/session";
import { redirect } from "next/navigation";
import { getLineSettingsMasked } from "@/lib/repositories/line-settings";
import { LineSettingsForm } from "@/features/line/components/line-settings-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "LINE 設定 | FlowRev",
};

export default async function LineSettingsPage() {
  const session = await getSessionProfile();
  if (!session || session.role !== "client_owner") redirect("/login");
  if (!session.clientId) redirect("/dashboard");

  const current = await getLineSettingsMasked(session.clientId).catch(() => null);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">LINE 設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          LINE Messaging API を使ってシナリオでメッセージを自動送信します。
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold">API 設定</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            LINE Developers Console で作成した Messaging API チャネルの情報を入力してください。
          </p>
        </div>
        <LineSettingsForm current={current} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 pb-4 border-b border-border">
          <h2 className="text-base font-semibold">設定手順</h2>
        </div>
        <ol className="flex flex-col gap-3 text-sm text-muted-foreground list-decimal list-inside">
          <li>
            <a
              href="https://developers.line.biz/console/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              LINE Developers Console
            </a>{" "}
            でプロバイダーと Messaging API チャネルを作成する
          </li>
          <li>
            チャネル基本設定から「チャネルシークレット」を取得して上に入力する
          </li>
          <li>
            Messaging API 設定 → チャネルアクセストークン（長期）から「発行」して入力する
          </li>
          <li>
            顧客詳細画面で各顧客の「LINE ユーザー ID」を設定する（ユーザーが友だち追加後に取得できます）
          </li>
          <li>
            シナリオのステップで「チャネル：LINE」を選択すると、LINE ユーザー ID が設定済みの顧客にメッセージが送信されます
          </li>
        </ol>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 pb-4 border-b border-border">
          <h2 className="text-base font-semibold">LINE 友だち追加 URL について</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          上で「LINE 友だち追加 URL」を設定すると、LP ページに「LINE を友だち追加する」ボタンが表示されます。
          顧客が友だち追加後、LINE ユーザー ID を取得して顧客プロフィールに登録することで LINE シナリオが利用できるようになります。
        </p>
      </section>
    </div>
  );
}
