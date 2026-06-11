import { ManualPart1 } from "@/features/manual/components/manual-part1";
import { ManualPart2 } from "@/features/manual/components/manual-part2";
import { ManualPart3 } from "@/features/manual/components/manual-part3";
import { ManualPart4 } from "@/features/manual/components/manual-part4";

export const metadata = {
  title: "操作マニュアル | FlowRev",
};

const TOC = [
  { id: "intro", label: "FlowRev とは", icon: "🚀" },
  { id: "dashboard", label: "ダッシュボード", icon: "⊞" },
  { id: "products", label: "商品管理", icon: "📦" },
  { id: "lp", label: "LP 管理", icon: "📄" },
  { id: "customers", label: "顧客管理", icon: "👥" },
  { id: "members", label: "コース・会員サイト", icon: "🎓" },
  { id: "scenarios", label: "フォローシナリオ", icon: "⚡" },
  { id: "ai", label: "AI 機能", icon: "✨" },
  { id: "purchases", label: "購入履歴", icon: "💳" },
  { id: "settings", label: "設定・FAQ", icon: "⚙️" },
];

export default function ManualPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">操作マニュアル</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          FlowRev の全機能の使い方を解説しています。
        </p>
      </div>

      {/* 目次 */}
      <nav className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">目次</p>
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {TOC.map(({ id, label, icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* 各セクション */}
      <div className="flex flex-col gap-10">
        <ManualPart1 />
        <ManualPart2 />
        <ManualPart3 />
        <ManualPart4 />
      </div>

      {/* フッター */}
      <div className="rounded-xl border border-border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
        このマニュアルは随時更新されます。ご不明な点は管理者までお問い合わせください。
      </div>
    </div>
  );
}
