import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { listCourses } from "@/lib/repositories/courses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireClientOwner } from "@/features/wl/guard";
import { getClientPlanFeatures } from "@/lib/features/client-features";
import { hasFeature } from "@/lib/features/plan-features";
import { FeatureDisabledMessage } from "@/features/dashboard/components/feature-gate";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await requireClientOwner();
  if (session.clientId) {
    const features = await getClientPlanFeatures(session.clientId);
    if (!hasFeature(features, "member_site")) {
      return <FeatureDisabledMessage featureName="会員サイト" />;
    }
  }
  let courses: Awaited<ReturnType<typeof listCourses>> = [];

  try {
    courses = await listCourses();
  } catch {
    courses = [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">会員サイト管理</h1>
        <Button asChild size="sm">
          <Link href="/members/new">
            <Plus className="h-4 w-4 mr-1.5" />
            コースを作成
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">コースがまだありません。</p>
          <p className="text-xs mt-1">
            「コースを作成」から会員向けコンテンツを追加してください。
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/members/${course.id}`}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-snug line-clamp-2">
                  {course.title}
                </p>
                <Badge
                  variant={course.status === "published" ? "default" : "secondary"}
                  className="shrink-0 text-xs"
                >
                  {course.status === "published" ? "公開" : "下書き"}
                </Badge>
              </div>
              {course.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                📚 {course.lessonCount ?? 0} レッスン
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
