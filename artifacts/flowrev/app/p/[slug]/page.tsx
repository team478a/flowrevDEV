import { notFound } from "next/navigation";
import { getPublishedLandingPageBySlug } from "@/lib/repositories/landing-pages";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeLpHtml } from "@/lib/sanitize";
import { LpContactForm } from "@/features/lp/components/lp-contact-form";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

/** 閲覧数をインクリメント（fire-and-forget、エラーは握りつぶす） */
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

export default async function PublicLpPage({ params }: Props) {
  let lp: Awaited<ReturnType<typeof getPublishedLandingPageBySlug>> = null;

  try {
    lp = await getPublishedLandingPageBySlug(params.slug);
  } catch {
    lp = null;
  }

  if (!lp) notFound();

  // 閲覧数を非同期でカウントアップ（ページ返却を待たない）
  void incrementViews(lp.id);

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

        {/* お問い合わせ / 登録フォーム */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 shadow-sm">
          <h2 className="text-xl font-bold text-center mb-2">
            お問い合わせ・ご登録
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            以下のフォームにご入力のうえ送信してください。
          </p>
          <LpContactForm lpId={lp.id} />
        </div>
      </div>
    </div>
  );
}
