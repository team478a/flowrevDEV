import Link from "next/link";
import { requireWhiteLabelOwner } from "@/features/wl/guard";
import { listWLPlansFull } from "@/lib/repositories/plans";
import { WLPlanRowActions } from "@/features/wl/components/wl-plan-row-actions";
import {
  getEnabledFeatureKeys,
  getFeatureLabel,
} from "@/lib/features/plan-features";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "プラン管理 | FlowRev WL",
};

function FeatureBadge({ featureKey }: { featureKey: string }) {
  const def = featureKey as Parameters<typeof getFeatureLabel>[0];
  return (
    <span className="inline-flex items-center rounded border border-border bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {getFeatureLabel(def)}
    </span>
  );
}

export default async function WLPlansPage() {
  const session = await requireWhiteLabelOwner();
  const items = await listWLPlansFull(session.whiteLabelId!);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            プラン管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            クライアントに割り当てるプランを管理します。機能フラグでプランを差別化できます。
          </p>
        </div>
        <Link
          href="/wl/plans/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          新規作成
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            プランがまだありません。「新規作成」から追加してください。
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p) => {
            const enabledKeys = getEnabledFeatureKeys(p.features);
            const hasNoSettings = Object.keys(p.features).length === 0;

            return (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                {/* 左：プラン情報 */}
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{p.name}</span>
                    <span className="text-sm font-medium text-primary">
                      ¥{p.priceMonthly.toLocaleString()}/月
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>クライアント上限: {p.maxClients.toLocaleString()}</span>
                    <span>商品上限: {p.maxProducts.toLocaleString()}</span>
                    <span>顧客上限: {p.maxCustomers.toLocaleString()}</span>
                  </div>

                  {/* 機能バッジ */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {hasNoSettings ? (
                      <span className="text-xs italic text-muted-foreground">
                        機能未設定（全機能デフォルト有効）
                      </span>
                    ) : enabledKeys.length === 0 ? (
                      <span className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        有効な機能なし
                      </span>
                    ) : (
                      enabledKeys.map((key) => (
                        <FeatureBadge key={key} featureKey={key} />
                      ))
                    )}
                  </div>
                </div>

                {/* 右：操作 */}
                <div className="shrink-0">
                  <WLPlanRowActions id={p.id} name={p.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
