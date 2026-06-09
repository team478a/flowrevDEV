import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CourseForm } from "@/features/members/components/course-form";
import { createCourseAction } from "@/features/members/actions";

export const dynamic = "force-dynamic";

export default function NewCoursePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/members"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          コース一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">コースを作成</h1>
      </div>

      <CourseForm
        action={createCourseAction}
        submitLabel="作成してレッスン追加へ"
      />
    </div>
  );
}
