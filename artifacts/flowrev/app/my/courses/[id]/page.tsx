import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileDown, CheckCircle2, Lock } from "lucide-react";
import { getSessionProfile } from "@/features/auth/session";
import {
  getPublishedCourse,
  listPublishedLessons,
} from "@/lib/repositories/courses-public";
import {
  getCustomerIdByUserId,
  getCourseProgress,
} from "@/lib/repositories/progress";
import { hasPurchasedProduct } from "@/lib/repositories/purchases";
import { CompleteButton } from "@/features/my/components/complete-button";
import { Badge } from "@/components/ui/badge";
import type { LessonRow } from "@/lib/repositories/courses";
import { getCloudflareSettingsResolved } from "@/lib/repositories/cloudflare-settings";
import { getStreamSignedToken } from "@/lib/cloudflare/stream";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
  searchParams: { lesson?: string };
}

function LessonContent({
  lesson,
  cfSignedToken,
}: {
  lesson: LessonRow;
  cfSignedToken?: string | null;
}) {
  if (
    lesson.contentType === "video" &&
    lesson.videoType === "cloudflare" &&
    lesson.cloudflareVideoId
  ) {
    if (!cfSignedToken) {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
          <div className="text-center text-white flex flex-col items-center gap-2">
            <Lock className="h-8 w-8 opacity-60" />
            <p className="text-sm opacity-60">動画を再生できません。</p>
          </div>
        </div>
      );
    }
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://iframe.cloudflarestream.com/${cfSignedToken}`}
          className="w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={lesson.title}
        />
      </div>
    );
  }
  if (lesson.contentType === "video" && lesson.videoUrl) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        <iframe
          src={lesson.videoUrl}
          className="w-full h-full"
          allowFullScreen
          title={lesson.title}
        />
      </div>
    );
  }
  if (lesson.contentType === "text" && lesson.textContent) {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: lesson.textContent }}
      />
    );
  }
  if (lesson.contentType === "file" && lesson.fileUrl) {
    return (
      <a
        href={lesson.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors text-sm"
      >
        <FileDown className="h-4 w-4" />
        ファイルをダウンロード
      </a>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      コンテンツがまだ設定されていません。
    </p>
  );
}

/**
 * 購入認可チェック済みの場合のみ Cloudflare 署名付きトークンを返す。
 * - コースに productId が設定されている → paid 購入必須
 * - productId なし → 全登録顧客がアクセス可能（購入チェック不要）
 * 認可失敗・設定未登録・API 失敗時はすべて null を返す。
 */
async function resolveAuthorizedCfToken(
  lesson: LessonRow | null,
  customerId: string | null,
  courseProductId: string | null,
): Promise<string | null> {
  if (
    !lesson ||
    lesson.contentType !== "video" ||
    lesson.videoType !== "cloudflare" ||
    !lesson.cloudflareVideoId
  ) {
    return null;
  }

  if (!customerId) return null;

  if (courseProductId) {
    const purchased = await hasPurchasedProduct(
      customerId,
      courseProductId,
    ).catch(() => false);
    if (!purchased) return null;
  }

  const settings = await getCloudflareSettingsResolved().catch(() => null);
  if (!settings) return null;

  return getStreamSignedToken(
    settings.accountId,
    settings.apiToken,
    lesson.cloudflareVideoId,
  ).catch((err: unknown) => {
    console.error("[Stream] トークン生成失敗:", err);
    return null;
  });
}

export default async function MyCoursePage({ params, searchParams }: Props) {
  const session = await getSessionProfile();
  if (!session || session.role !== "customer") redirect("/login");
  if (!session.clientId) redirect("/my");

  const [course, lessons, customerId] = await Promise.all([
    getPublishedCourse(params.id, session.clientId).catch(() => null),
    listPublishedLessons(params.id).catch(() => []),
    getCustomerIdByUserId(session.userId),
  ]);

  if (!course) notFound();

  const progressList = customerId
    ? await getCourseProgress(customerId, params.id).catch(() => [])
    : [];

  const completedIds = new Set(
    progressList.filter((p) => p.completed).map((p) => p.lessonId),
  );

  const selectedId = searchParams.lesson ?? lessons[0]?.id ?? null;
  const selectedLesson = lessons.find((l) => l.id === selectedId) ?? null;

  const cfSignedToken = await resolveAuthorizedCfToken(
    selectedLesson,
    customerId,
    course.productId ?? null,
  );

  const done = completedIds.size;
  const total = lessons.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/my"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          コース一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {course.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {course.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          進捗: {done}/{total} レッスン完了
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
        {/* レッスン一覧サイドバー */}
        <nav className="flex flex-col gap-1 md:sticky md:top-4">
          {lessons.map((lesson, idx) => {
            const isSelected = lesson.id === selectedId;
            const isCompleted = completedIds.has(lesson.id);
            return (
              <Link
                key={lesson.id}
                href={`/my/courses/${params.id}?lesson=${lesson.id}`}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <span className="w-4 h-4 shrink-0 flex items-center justify-center text-xs text-muted-foreground font-mono">
                    {idx + 1}
                  </span>
                )}
                <span className="line-clamp-2">{lesson.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* レッスンコンテンツ */}
        <div className="flex flex-col gap-4">
          {selectedLesson ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {selectedLesson.title}
                  </h2>
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedLesson.contentType === "video"
                      ? "動画"
                      : selectedLesson.contentType === "text"
                        ? "テキスト"
                        : "ファイル"}
                  </Badge>
                </div>
                {customerId && (
                  <CompleteButton
                    lessonId={selectedLesson.id}
                    courseId={params.id}
                    isCompleted={completedIds.has(selectedLesson.id)}
                  />
                )}
              </div>
              <LessonContent
                lesson={selectedLesson}
                cfSignedToken={cfSignedToken}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              左のリストからレッスンを選択してください。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
