import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  getCloudflareSettingsMasked,
  upsertCloudflareSettings,
} from "@/lib/repositories/cloudflare-settings";
import { getLatestProtectLog } from "@/lib/repositories/cloudflare-protect-logs";
import { CloudflareSettingsForm } from "@/features/admin/components/cloudflare-settings-form";
import { ProtectAllVideosButton } from "@/features/admin/components/protect-all-videos-button";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "動画設定（Cloudflare Stream）| FlowRev",
};

async function saveVideoSettingAction(
  _prev: { error: string | null; success?: boolean },
  formData: FormData,
): Promise<{ error: string | null; success?: boolean }> {
  "use server";
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") redirect("/login");

  const accountId = ((formData.get("accountId") as string | null) ?? "").trim();
  const apiToken = ((formData.get("apiToken") as string | null) ?? "").trim();

  try {
    await upsertCloudflareSettings({
      accountId: accountId || undefined,
      apiToken: apiToken || undefined,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存に失敗しました。" };
  }

  revalidatePath("/admin/settings/video");
  return { error: null, success: true };
}

function formatJst(isoString: string): string {
  return new Date(isoString).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function VideoSettingsPage() {
  const session = await getSessionProfile();
  if (!session || session.role !== "system_admin") redirect("/login");

  const [current, latestLog] = await Promise.all([
    getCloudflareSettingsMasked().catch(() => null),
    getLatestProtectLog().catch(() => null),
  ]);

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
          動画設定（Cloudflare Stream）
        </h1>
        <p className="text-sm text-muted-foreground">
          会員サイトのレッスン動画をホスティングする Cloudflare Stream の設定です。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <CloudflareSettingsForm current={current} action={saveVideoSettingAction} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-1 text-foreground">既存動画の一括保護</h2>
        <p className="text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
          API 設定完了後、この機能が有効になります。新規アップロード動画は自動的に保護されますが、
          設定前にアップロードされた動画はこちらで一括保護してください。
        </p>

        {latestLog && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground mb-4">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              最終実行:{" "}
              <span className="font-medium text-foreground">
                {formatJst(latestLog.executedAt)}
              </span>
              {" — "}
              <span className="font-medium text-foreground">
                {latestLog.updated} 件
              </span>
              更新
              {latestLog.failed > 0 && (
                <span className="text-red-600 ml-1">
                  （{latestLog.failed} 件失敗）
                </span>
              )}
              {" / "}対象 {latestLog.total} 件
            </span>
          </div>
        )}

        <ProtectAllVideosButton />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-4 pb-4 border-b border-border">設定手順</h2>
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
            右上の「マイプロフィール」→「API トークン」→「トークンを作成」→ 
            テンプレート「Cloudflare Stream」を選択してトークンを発行する
          </li>
          <li>
            アカウント ID はダッシュボードの右サイドバー（「アカウント ID」）からコピーする
          </li>
          <li>
            取得した値を上のフォームに入力して保存する
          </li>
          <li>
            設定後、client_owner がレッスン編集画面から動画ファイルをアップロードできるようになります
          </li>
        </ol>
      </div>
    </div>
  );
}
