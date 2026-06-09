import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getLandingPage } from "@/lib/repositories/landing-pages";
import { listProducts } from "@/lib/repositories/products";
import { LpForm } from "@/features/lp/components/lp-form";
import { updateLpAction, deleteLpAction } from "@/features/lp/actions";
import { DeleteLpButton } from "@/features/lp/components/delete-lp-button";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function EditLpPage({ params }: Props) {
  let lp: Awaited<ReturnType<typeof getLandingPage>> = null;
  let products: Awaited<ReturnType<typeof listProducts>> = [];

  try {
    [lp, products] = await Promise.all([
      getLandingPage(params.id),
      listProducts(),
    ]);
  } catch {
    lp = null;
    products = [];
  }

  if (!lp) notFound();

  const boundUpdateAction = updateLpAction.bind(null, lp.id);

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
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">LPを編集</h1>
          <div className="flex items-center gap-2">
            {lp.status === "published" && (
              <Link
                href={`/p/${lp.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                公開ページを見る
              </Link>
            )}
            <DeleteLpButton
              lpId={lp.id}
              lpTitle={lp.title}
              deleteAction={deleteLpAction}
            />
          </div>
        </div>
      </div>

      <LpForm
        action={boundUpdateAction}
        defaultValues={lp}
        products={products.map((p) => ({ id: p.id, name: p.name }))}
        submitLabel="保存する"
        successPath="/lp"
      />
    </div>
  );
}
