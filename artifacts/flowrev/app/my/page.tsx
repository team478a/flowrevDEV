import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getSessionProfile } from "@/features/auth/session";
import { redirect } from "next/navigation";
import { listPublishedCourses } from "@/lib/repositories/courses-public";
import {
  getCustomerIdByUserId,
  getCompletedCountsByCourse,
} from "@/lib/repositories/progress";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await getSessionProfile();
  if (!session || session.role !== "customer") redirect("/login");
  if (!session.clientId) {
    return (
      <p className="text-sm text-muted-foreground">
        クライアント情報が取得できませんでした。管理者へお問い合わせください。
      </p>
    );
  }

  const [courses, customerId] = await Promise.all([
    listPublishedCourses(session.clientId).catch(() => []),
    getCustomerIdByUserId(session.userId),
  ]);

  const completedCounts = customerId
    ? await getCompletedCountsByCourse(customerId).catch(() => new Map<string, number>())
    : new Map<string, number>();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          ようこそ、{session.displayName ?? session.email} さん
        </h1>
        <p className="text-sm text-muted-foreground">{session.email}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">受講できるコース</h2>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">現在受講できるコースはありません。</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const total = course.lessonCount ?? 0;
              const done = completedCounts.get(course.id) ?? 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <Link
                  key={course.id}
                  href={`/my/courses/${course.id}`}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <p className="font-medium leading-snug line-clamp-2">
                    {course.title}
                  </p>
                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <p className="text-xs text-muted-foreground">
                      {total} レッスン
                    </p>
                    {total > 0 && (
                      <Badge
                        variant={pct === 100 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {pct === 100 ? "✅ 完了" : `${done}/${total} 完了`}
                      </Badge>
                    )}
                  </div>
                  {total > 0 && (
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
