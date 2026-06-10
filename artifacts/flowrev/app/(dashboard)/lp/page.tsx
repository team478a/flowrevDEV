import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { listLandingPages } from "@/lib/repositories/landing-pages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireClientOwner } from "@/features/wl/guard";
import { getClientPlanFeatures } from "@/lib/features/client-features";
import { hasFeature } from "@/lib/features/plan-features";
import { FeatureDisabledMessage } from "@/features/dashboard/components/feature-gate";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "下書き",
  published: "公開中",
  archived: "アーカイブ",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "secondary",
  published: "default",
  archived: "outline",
};

export default async function LpListPage() {
  const session = await requireClientOwner();
  if (session.clientId) {
    const features = await getClientPlanFeatures(session.clientId);
    if (!hasFeature(features, "lp_builder")) {
      return <FeatureDisabledMessage featureName="LP管理" />;
    }
  }

  let pages: Awaited<ReturnType<typeof listLandingPages>> = [];
  let fetchError: string | null = null;

  try {
    pages = await listLandingPages();
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "取得に失敗しました";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LP管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ランディングページを管理します
          </p>
        </div>
        <Button asChild>
          <Link href="/lp/new">
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Link>
        </Button>
      </div>

      {fetchError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {fetchError}
        </p>
      )}

      {pages.length === 0 && !fetchError && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 border border-dashed rounded-lg">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            LPがまだありません
          </p>
          <Button asChild size="sm">
            <Link href="/lp/new">最初のLPを作成する</Link>
          </Button>
        </div>
      )}

      {pages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((lp) => (
            <Link
              key={lp.id}
              href={`/lp/${lp.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-sm line-clamp-2">
                  {lp.title}
                </span>
                <Badge variant={STATUS_VARIANT[lp.status] ?? "secondary"}>
                  {STATUS_LABEL[lp.status] ?? lp.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3 font-mono">
                /p/{lp.slug}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>閲覧 {lp.views.toLocaleString()}</span>
                <span>
                  CV率{" "}
                  {lp.views > 0
                    ? ((lp.conversions / lp.views) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
