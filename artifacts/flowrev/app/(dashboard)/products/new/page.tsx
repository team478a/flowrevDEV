import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/features/products/components/product-form";
import { createProductAction } from "@/features/products/actions";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          商品一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">商品を新規作成</h1>
      </div>

      <ProductForm
        action={createProductAction}
        submitLabel="作成する"
      />
    </div>
  );
}
