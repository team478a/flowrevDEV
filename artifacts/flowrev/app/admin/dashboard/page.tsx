import Link from "next/link";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { getSessionProfile } from "@/features/auth/session";
import { getCloudflareSettingsResolved } from "@/lib/repositories/cloudflare-settings";
import { countUnprotectedVideos } from "@/lib/cloudflare/stream";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "システム管理 | FlowRev",
};

type VideoProtectionState =
  | { kind: "unconfigured" }
  | { kind: "error" }
  | { kind: "ok"; unprotected: number; total: number };

async function fetchVideoProtectionState(): Promise<VideoProtectionState> {
  try {
    const settings = await getCloudflareSettingsResolved();
    if (!settings) return { kind: "unconfigured" };
    const result = await countUnprotectedVideos(
      settings.accountId,
      settings.apiToken,
    );
    return { kind: "ok", unprotected: result.unprotected, total: result.total };
  } catch {
    return { kind: "error" };
  }
}

export default async function AdminDashboardPage() {
  const [session, videoState] = await Promise.all([
    getSessionProfile(),
    fetchVideoProtectionState(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          システム管理ダッシュボード
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ようこそ、{session?.displayName ?? session?.email ?? "管理者"} さん
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            ホワイトラベル
          </span>
          <span className="text-3xl font-bold text-foreground">—</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            プラン
          </span>
          <span className="text-3xl font-bold text-foreground">—</span>
        </div>
        <VideoProtectionCard state={videoState} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-foreground">
          管理メニュー
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/white-labels"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ホワイトラベル管理
          </Link>
          <Link
            href="/admin/plans"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            プラン管理
          </Link>
          <Link
            href="/admin/settings/email"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            メール設定
          </Link>
          <Link
            href="/admin/settings/ai"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            AI設定 (Anthropic)
          </Link>
          <Link
            href="/admin/settings/openai"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            AI設定 (OpenAI)
          </Link>
          <Link
            href="/admin/settings/cloudflare"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Cloudflare 設定
          </Link>
        </div>
      </div>
    </div>
  );
}

function VideoProtectionCard({ state }: { state: VideoProtectionState }) {
  if (state.kind === "unconfigured") {
    return (
      <Link
        href="/admin/settings/video"
        className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent/30"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          動画保護
        </span>
        <span className="text-sm text-muted-foreground mt-1">未設定</span>
        <span className="mt-2 text-xs text-muted-foreground underline">
          設定する →
        </span>
      </Link>
    );
  }

  if (state.kind === "error") {
    return (
      <Link
        href="/admin/settings/video"
        className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent/30"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          動画保護
        </span>
        <span className="text-sm text-red-600 mt-1">取得エラー</span>
        <span className="mt-2 text-xs text-muted-foreground underline">
          設定を確認 →
        </span>
      </Link>
    );
  }

  const { unprotected, total } = state;
  const allProtected = unprotected === 0;

  return (
    <Link
      href="/admin/settings/video"
      className={[
        "flex flex-col gap-1 rounded-xl border p-5 shadow-sm transition-colors",
        allProtected
          ? "border-green-200 bg-green-50 hover:bg-green-100/70"
          : "border-amber-200 bg-amber-50 hover:bg-amber-100/70",
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5">
        {allProtected ? (
          <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
        ) : (
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        )}
        <span
          className={[
            "text-xs font-medium uppercase tracking-wide",
            allProtected ? "text-green-700" : "text-amber-700",
          ].join(" ")}
        >
          動画保護
        </span>
      </div>
      <span
        className={[
          "text-3xl font-bold",
          allProtected ? "text-green-700" : "text-amber-700",
        ].join(" ")}
      >
        {allProtected ? "全件保護済み" : `未保護 ${unprotected} 件`}
      </span>
      <span
        className={[
          "text-xs mt-0.5",
          allProtected ? "text-green-600" : "text-amber-600",
        ].join(" ")}
      >
        {total} 件中 {total - unprotected} 件保護済み・設定を見る →
      </span>
    </Link>
  );
}
