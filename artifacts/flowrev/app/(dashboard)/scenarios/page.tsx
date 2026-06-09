import Link from "next/link";
import { Plus, Zap } from "lucide-react";
import { listScenarios } from "@/lib/repositories/scenarios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRIGGER_TYPES } from "@/features/scenarios/schema";

export const dynamic = "force-dynamic";

const triggerLabel = (type: string) =>
  TRIGGER_TYPES.find((t) => t.value === type)?.label ?? type;

export default async function ScenariosPage() {
  let scenarios: Awaited<ReturnType<typeof listScenarios>> = [];

  try {
    scenarios = await listScenarios();
  } catch {
    scenarios = [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">フォローシナリオ</h1>
        <Button asChild size="sm">
          <Link href="/scenarios/new">
            <Plus className="h-4 w-4 mr-1.5" />
            新規作成
          </Link>
        </Button>
      </div>

      {scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Zap className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">シナリオがまだありません。</p>
          <p className="text-xs mt-1">
            「新規作成」からフォローシナリオを作成してください。
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <Link
              key={s.id}
              href={`/scenarios/${s.id}`}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-snug line-clamp-2">
                  {s.name}
                </p>
                <Badge
                  variant={s.status === "active" ? "default" : "secondary"}
                  className="shrink-0 text-xs"
                >
                  {s.status === "active" ? "有効" : "無効"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>⚡ {triggerLabel(s.triggerType)}</span>
                <span>·</span>
                <span>{s.stepCount ?? 0} ステップ</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
