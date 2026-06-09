import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { listProducts } from "@/lib/repositories/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  let fetchError: string | null = null;

  try {
    products = await listProducts();
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "取得に失敗しました";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">商品管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            販売する商品を管理します
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
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

      {products.length === 0 && !fetchError && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 border border-dashed rounded-lg">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">商品がまだありません</p>
          <Button asChild size="sm">
            <Link href="/products/new">最初の商品を作成する</Link>
          </Button>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-sm line-clamp-2">
                  {p.name}
                </span>
                <Badge variant={STATUS_VARIANT[p.status] ?? "secondary"}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </Badge>
              </div>
              {p.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {p.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {p.priceType === "free"
                    ? "無料"
                    : `¥${p.price.toLocaleString()}`}
                </span>
                {p.category && <span>{p.category}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
