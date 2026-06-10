import { notFound } from "next/navigation";
import { getPublishedLandingPageBySlug } from "@/lib/repositories/landing-pages";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeLpHtml } from "@/lib/sanitize";
import { LpContactForm } from "@/features/lp/components/lp-contact-form";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

interface ProductInfo {
  name: string;
  price: number;
  priceType: string;
}

/** 閲覧数をインクリメント（fire-and-forget） */
async function incrementViews(lpId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("landing_pages")
      .select("views")
      .eq("id", lpId)
      .maybeSingle();
    const current = ((data as Record<string, unknown> | null)?.views as number) ?? 0;
    await admin
      .from("landing_pages")
      .update({ views: current + 1 })
      .eq("id", lpId);
  } catch {
    // 閲覧カウント失敗はページ表示に影響させない
  }
}

/** LP に紐付く商品情報を取得（有料の場合のみ） */
async function getProductForLp(lpId: string): Promise<ProductInfo | null> {
  try {
    const admin = createAdminClient();
    const { data: lpRow } = await admin
      .from("landing_pages")
      .select("product_id")
      .eq("id", lpId)
      .maybeSingle();

    const productId = (lpRow as Record<string, unknown> | null)?.product_id as string | null;
    if (!productId) return null;

    const { data: productRow } = await admin
      .from("products")
      .select("name, price, price_type")
      .eq("id", productId)
      .maybeSingle();

    if (!productRow) return null;
    const p = productRow as Record<string, unknown>;
    const price = (p.price as number) ?? 0;
    const priceType = (p.price_type as string) ?? "free";

    if (price <= 0 || priceType === "free") return null;

    return {
      name: (p.name as string) ?? "",
      price,
      priceType,
    };
  } catch {
    return null;
  }
}

export default async function PublicLpPage({ params }: Props) {
  let lp: Awaited<ReturnType<typeof getPublishedLandingPageBySlug>> = null;

  try {
    lp = await getPublishedLandingPageBySlug(params.slug);
  } catch {
    lp = null;
  }

  if (!lp) notFound();

  const [product] = await Promise.all([
    getProductForLp(lp.id),
    incrementViews(lp.id),
  ]);

  const isPaid = !!product;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* LPコンテンツ（HTML） */}
        {lp.htmlContent ? (
          <div
            className="prose prose-lg max-w-none mb-16"
            dangerouslySetInnerHTML={{ __html: sanitizeLpHtml(lp.htmlContent) }}
          />
        ) : (
          <div className="text-center py-20 text-gray-400 mb-16">
            <p className="text-lg font-semibold text-gray-700">{lp.title}</p>
            <p className="text-sm mt-2">コンテンツが設定されていません</p>
          </div>
        )}

        {/* 価格カード（有料商品の場合のみ） */}
        {isPaid && product && (
          <div className="mb-6 rounded-2xl border-2 border-primary/30 bg-primary/5 px-6 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70 mb-1">
              {product.name}
            </p>
            <p className="text-4xl font-bold text-primary">
              ¥{product.price.toLocaleString()}
              <span className="text-base font-normal text-muted-foreground ml-1">（税込）</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              下のフォームにご入力いただくと、Stripe の決済画面に移動します。
            </p>
          </div>
        )}

        {/* お問い合わせ / 購入フォーム */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 shadow-sm">
          <h2 className="text-xl font-bold text-center mb-2">
            {isPaid ? "ご購入手続き" : "お問い合わせ・ご登録"}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            {isPaid
              ? "以下にご入力のうえ「今すぐ購入する」をクリックしてください。"
              : "以下のフォームにご入力のうえ送信してください。"}
          </p>
          <LpContactForm lpId={lp.id} isPaid={isPaid} />
        </div>
      </div>
    </div>
  );
}
