import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Settings2, Clock, ChevronDown, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { getSessionProfile } from "@/features/auth/session";
import {
  getCloudflareSettingsMasked,
  upsertCloudflareSettings,
} from "@/lib/repositories/cloudflare-settings";
import {
  getLatestProtectLog,
  getProtectLogsPage,
} from "@/lib/repositories/cloudflare-protect-logs";
import { ProtectAllVideosButton } from "@/features/admin/components/protect-all-videos-button";
import {
  AlertEmailsForm,
  type AlertEmailsFormState,
} from "@/features/admin/components/alert-emails-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "動画設定（Cloudflare Stream）| FlowRev",
};

const PAGE_SIZE = 20;

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

function buildPageUrl(page: number): string {
  return `/admin/settings/video?page=${page}`;
}

async function saveAlertEmailsAction(
  _prev: AlertEmailsFormState,
  formData: FormData,
): Promise<AlertEmailsFormState> {
  "use server";
  const session = await getSessionProfile();
  if (session?.role !== "system_admin") redirect("/login");

  const raw = ((formData.get("alertEmails") as string | null) ?? "").trim();

  const normalized = raw
    ? raw
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
        .join(", ")
    : null;

  try {
    await upsertCloudflareSettings({ alertEmails: normalized });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存に失敗しました。" };
  }

  revalidatePath("/admin/settings/video");
  return { error: null, success: true };
}

export default async function VideoSettingsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getSessionProfile();
  if (!session || session.role !== "system_admin") redirect("/login");

  const currentPage = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const [current, latestLog, logsPage] = await Promise.all([
    getCloudflareSettingsMasked().catch(() => null),
    getLatestProtectLog().catch(() => null),
    getProtectLogsPage(currentPage, PAGE_SIZE).catch(() => ({
      logs: [],
      total: 0,
      page: currentPage,
      pageSize: PAGE_SIZE,
    })),
  ]);

  const isConfigured = !!current?.accountId && !!current?.hasApiToken;

  const totalPages = Math.ceil(logsPage.total / PAGE_SIZE);
  const rangeStart = logsPage.total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, logsPage.total);

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
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">
              Cloudflare 認証情報
            </h2>
            <p className="text-sm text-muted-foreground">
              アカウント ID・API トークン・Webhook シークレットの設定は Cloudflare 設定ページで行います。
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              {isConfigured ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  設定済み
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  未設定
                </span>
              )}
            </div>
          </div>
          <Link
            href="/admin/settings/cloudflare"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
          >
            <Settings2 className="h-4 w-4" />
            Cloudflare 設定へ
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-1 text-foreground">既存動画の一括保護</h2>
        <p className="text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
          API 設定完了後、この機能が有効になります。新規アップロード動画は自動的に保護されますが、
          設定前にアップロードされた動画はこちらで一括保護してください。
        </p>

        {latestLog && (
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
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

            {latestLog.failed > 0 && latestLog.errorDetails && latestLog.errorDetails.length > 0 && (
              <details className="group rounded-md border border-red-200 bg-red-50 text-xs">
                <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-red-700 hover:bg-red-100/60 select-none list-none">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">
                    失敗した動画 ID を確認する（{latestLog.errorDetails.length} 件）
                  </span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="border-t border-red-200 divide-y divide-red-100">
                  {latestLog.errorDetails.map((detail, i) => {
                    const colonIdx = detail.indexOf(": ");
                    const videoId = colonIdx !== -1 ? detail.slice(0, colonIdx) : detail;
                    const errorMsg = colonIdx !== -1 ? detail.slice(colonIdx + 2) : "";
                    return (
                      <li key={i} className="px-3 py-1.5">
                        <span className="font-mono text-red-800 break-all">{videoId}</span>
                        {errorMsg && (
                          <span className="ml-2 text-red-600 break-all">{errorMsg}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}
          </div>
        )}

        <ProtectAllVideosButton />
      </div>

      {logsPage.total > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">実行履歴</h2>
            <span className="text-xs text-muted-foreground">
              {rangeStart}–{rangeEnd} / 全 {logsPage.total} 件
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">日時（JST）</th>
                  <th className="pb-2 pr-4 font-medium">実行者</th>
                  <th className="pb-2 pr-4 font-medium text-right">対象</th>
                  <th className="pb-2 pr-4 font-medium text-right">更新</th>
                  <th className="pb-2 font-medium text-right">失敗</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logsPage.logs.map((log) => {
                  const hasFailed = log.failed > 0;
                  return (
                    <tr
                      key={log.id}
                      className={hasFailed ? "text-red-600" : "text-foreground"}
                    >
                      <td className="py-2 pr-4 font-mono whitespace-nowrap">
                        {formatJst(log.executedAt)}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                        {log.executorName ?? (log.executedBy ? log.executedBy.slice(0, 8) + "…" : "システム")}
                      </td>
                      <td className="py-2 pr-4 text-right">{log.total}</td>
                      <td className="py-2 pr-4 text-right">{log.updated}</td>
                      <td className="py-2 text-right font-medium">
                        {hasFailed ? log.failed : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
              <Link
                href={buildPageUrl(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                className={[
                  "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  currentPage <= 1
                    ? "pointer-events-none border-border text-muted-foreground/40 bg-muted/30"
                    : "border-border bg-background text-foreground hover:bg-muted",
                ].join(" ")}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                前へ
              </Link>

              <span className="text-xs text-muted-foreground">
                {currentPage} / {totalPages} ページ
              </span>

              <Link
                href={buildPageUrl(currentPage + 1)}
                aria-disabled={currentPage >= totalPages}
                className={[
                  "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  currentPage >= totalPages
                    ? "pointer-events-none border-border text-muted-foreground/40 bg-muted/30"
                    : "border-border bg-background text-foreground hover:bg-muted",
                ].join(" ")}
              >
                次へ
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-1 text-foreground">
          未保護動画アラート通知先
        </h2>
        <p className="text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
          定期チェックで未保護動画が検出された場合の通知先を設定します。
          未設定の場合は system_admin のメールアドレスに送信されます。
        </p>
        <AlertEmailsForm
          currentEmails={current?.alertEmails ?? null}
          action={saveAlertEmailsAction}
        />
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
            取得した値を{" "}
            <Link
              href="/admin/settings/cloudflare"
              className="text-primary underline"
            >
              Cloudflare 設定ページ
            </Link>
            {" "}に入力して保存する
          </li>
          <li>
            設定後、client_owner がレッスン編集画面から動画ファイルをアップロードできるようになります
          </li>
        </ol>
      </div>
    </div>
  );
}
