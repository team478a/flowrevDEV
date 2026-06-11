import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  getCloudflareSettingsMasked,
  upsertCloudflareSettings,
} from "@/lib/repositories/cloudflare-settings";
import { CloudflareSettingsForm } from "@/features/admin/components/cloudflare-settings-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cloudflare 設定 | FlowRev",
};

async function saveCloudflareSettingsAction(
  _prev: { error: string | null; success?: boolean },
  formData: FormData,
): Promise<{ error: string | null; success?: boolean }> {
  "use server";
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") redirect("/login");

  const accountId = ((formData.get("accountId") as string | null) ?? "").trim();
  const apiToken = ((formData.get("apiToken") as string | null) ?? "").trim();
  const webhookSecret = ((formData.get("webhookSecret") as string | null) ?? "").trim();

  try {
    await upsertCloudflareSettings({
      accountId: accountId || undefined,
      apiToken: apiToken || undefined,
      webhookSecret: webhookSecret || undefined,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存に失敗しました。" };
  }

  revalidatePath("/admin/settings/cloudflare");
  return { error: null, success: true };
}

export default async function CloudflareSettingsPage() {
  const session = await getSessionProfile();
  if (!session || session.role !== "system_admin") redirect("/login");

  const current = await getCloudflareSettingsMasked().catch(() => null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 管理ダッシュボード
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Cloudflare 設定
        </h1>
        <p className="text-sm text-muted-foreground">
          Cloudflare Stream の API 認証情報と Webhook シークレットを管理します。キーは暗号化して保存されます。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <CloudflareSettingsForm current={current} action={saveCloudflareSettingsAction} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-4 pb-4 border-b border-border">Webhook シークレットの取得手順</h2>
        <ol className="flex flex-col gap-3 text-sm text-muted-foreground list-decimal list-inside">
          <li>
            <a
              href="https://dash.cloudflare.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Cloudflare ダッシュボード
            </a>
            {" "}にログインし、対象アカウントを開く
          </li>
          <li>
            左メニューから「Stream」→「Webhooks」を選択する
          </li>
          <li>
            「Add endpoint」をクリックし、Webhook URL に
            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs font-mono">
              https://&#x3C;your-domain&#x3E;/api/webhooks/cloudflare-stream
            </code>
            を入力する
          </li>
          <li>
            発行されたシークレットをコピーし、上のフォームの「Webhook シークレット」欄に貼り付けて保存する
          </li>
        </ol>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-4 pb-4 border-b border-border">API トークンの取得手順</h2>
        <ol className="flex flex-col gap-3 text-sm text-muted-foreground list-decimal list-inside">
          <li>
            Cloudflare ダッシュボードの「マイプロフィール」→「API トークン」→「トークンを作成」を開く
          </li>
          <li>
            テンプレート「Cloudflare Stream」を選択してトークンを発行する
          </li>
          <li>
            アカウント ID はダッシュボードの右サイドバー（「アカウント ID」）からコピーする
          </li>
          <li>
            取得した値を上のフォームに入力して保存する
          </li>
        </ol>
      </div>
    </div>
  );
}
