import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listProducts } from "@/lib/repositories/products";
import { LpForm } from "@/features/lp/components/lp-form";
import { createLpAction } from "@/features/lp/actions";

export const dynamic = "force-dynamic";

export default async function NewLpPage() {
  let products: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    products = await listProducts();
  } catch {
    products = [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/lp"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          LP一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">LPを新規作成</h1>
      </div>

      <LpForm
        action={createLpAction}
        products={products.map((p) => ({ id: p.id, name: p.name }))}
        submitLabel="作成する"
      />
    </div>
  );
}
