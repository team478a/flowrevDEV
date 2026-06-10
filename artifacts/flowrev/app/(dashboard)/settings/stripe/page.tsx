import { getSessionProfile } from "@/features/auth/session";
import { redirect } from "next/navigation";
import { getStripeSettingsMasked } from "@/lib/repositories/stripe-settings";
import { StripeSettingsForm } from "@/features/stripe/components/stripe-settings-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stripe 設定 | FlowRev",
};

export default async function StripeSettingsPage() {
  const session = await getSessionProfile();
  if (!session || session.role !== "client_owner") redirect("/login");
  if (!session.clientId) redirect("/dashboard");

  const current = await getStripeSettingsMasked(session.clientId).catch(() => null);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stripe 決済設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          LP フォームからの決済に使用する Stripe アカウントを設定します。
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold">API キー設定</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            設定後、商品に価格を設定した LP から Stripe の決済画面に誘導されます。
          </p>
        </div>
        <StripeSettingsForm current={current} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 pb-4 border-b border-border">
          <h2 className="text-base font-semibold">設定手順</h2>
        </div>
        <ol className="flex flex-col gap-3 text-sm text-muted-foreground list-decimal list-inside">
          <li>
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Stripe ダッシュボード
            </a>{" "}
            → 開発者 → API キー から「シークレットキー」を取得して上に入力
          </li>
          <li>
            Stripe ダッシュボード → Webhook → 「エンドポイントを追加」→
            URL に{" "}
            <code className="bg-muted px-1 rounded text-xs">
              https://あなたのドメイン/api/webhooks/stripe
            </code>{" "}
            を入力 → イベント{" "}
            <code className="bg-muted px-1 rounded text-xs">
              checkout.session.completed
            </code>{" "}
            を選択
          </li>
          <li>
            Webhook 登録後に表示される「署名シークレット（whsec_...）」を上の
            「Webhook シークレット」に入力
          </li>
          <li>
            商品管理で価格を設定 → LP に商品を紐付けると、LP フォーム送信後に
            Stripe 決済が開始されます
          </li>
        </ol>
      </section>
    </div>
  );
}
