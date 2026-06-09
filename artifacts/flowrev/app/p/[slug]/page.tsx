import { notFound } from "next/navigation";
import { getPublishedLandingPageBySlug } from "@/lib/repositories/landing-pages";
import { sanitizeLpHtml } from "@/lib/sanitize";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export default async function PublicLpPage({ params }: Props) {
  let lp: Awaited<ReturnType<typeof getPublishedLandingPageBySlug>> = null;

  try {
    lp = await getPublishedLandingPageBySlug(params.slug);
  } catch {
    lp = null;
  }

  if (!lp) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {lp.htmlContent ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeLpHtml(lp.htmlContent) }}
          />
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">{lp.title}</p>
            <p className="text-sm mt-2">コンテンツが設定されていません</p>
          </div>
        )}
      </div>
    </div>
  );
}
