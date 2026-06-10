import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listProducts } from "@/lib/repositories/products";
import { LpForm } from "@/features/lp/components/lp-form";
import { LpCreateModeSelector } from "@/features/lp/components/lp-create-mode-selector";
import { LpEasyWizard } from "@/features/lp/components/lp-easy-wizard";
import { createLpAction } from "@/features/lp/actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { mode?: string };
}

export default async function NewLpPage({ searchParams }: Props) {
  const mode = searchParams.mode;

  let products: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    if (mode === "easy" || mode === "advanced") {
      products = await listProducts();
    }
  } catch {
    products = [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={mode ? "/lp/new" : "/lp"}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {mode ? "作成方法の選択に戻る" : "LP一覧に戻る"}
        </Link>
        <h1 className="text-2xl font-bold">
          {mode === "easy"
            ? "かんたん作成"
            : mode === "advanced"
              ? "自由編集"
              : "LPを新規作成"}
        </h1>
        {!mode && (
          <p className="mt-1 text-sm text-muted-foreground">
            WordPressよりも簡単にLPが作れます
          </p>
        )}
      </div>

      {/* モード選択 */}
      {!mode && <LpCreateModeSelector />}

      {/* かんたん作成ウィザード */}
      {mode === "easy" && (
        <LpEasyWizard
          action={createLpAction}
          products={products.map((p) => ({ id: p.id, name: p.name }))}
        />
      )}

      {/* 自由編集（既存フォーム） */}
      {mode === "advanced" && (
        <LpForm
          action={createLpAction}
          products={products.map((p) => ({ id: p.id, name: p.name }))}
          submitLabel="作成する"
        />
      )}
    </div>
  );
}
