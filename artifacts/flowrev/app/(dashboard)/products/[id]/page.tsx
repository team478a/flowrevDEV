import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProduct } from "@/lib/repositories/products";
import { getProductImageSignedUrl } from "@/lib/storage";
import { ProductForm } from "@/features/products/components/product-form";
import { ImageUpload } from "@/features/products/components/image-upload";
import {
  updateProductAction,
  deleteProductAction,
  uploadProductImageAction,
} from "@/features/products/actions";
import { DeleteProductButton } from "@/features/products/components/delete-product-button";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  let product: Awaited<ReturnType<typeof getProduct>> = null;
  let signedUrl: string | null = null;

  try {
    product = await getProduct(params.id);
    if (product?.thumbnailUrl) {
      signedUrl = await getProductImageSignedUrl(product.thumbnailUrl);
    }
  } catch {
    product = null;
  }

  if (!product) notFound();

  const boundUpdateAction = updateProductAction.bind(null, product.id);
  const boundUploadAction = uploadProductImageAction.bind(null, product.id);

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">商品を編集</h1>
          <DeleteProductButton
            productId={product.id}
            productName={product.name}
            deleteAction={deleteProductAction}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">サムネイル画像</p>
        <ImageUpload
          productId={product.id}
          currentSignedUrl={signedUrl}
          uploadAction={boundUploadAction}
        />
      </div>

      <ProductForm
        action={boundUpdateAction}
        defaultValues={product}
        submitLabel="保存する"
        successPath="/products"
      />
    </div>
  );
}
