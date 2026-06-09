import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCourse, listLessons } from "@/lib/repositories/courses";
import { CourseForm } from "@/features/members/components/course-form";
import { LessonEditor } from "@/features/members/components/lesson-editor";
import { DeleteCourseButton } from "@/features/members/components/delete-course-button";
import {
  updateCourseAction,
  deleteCourseAction,
  addLessonAction,
  updateLessonAction,
  deleteLessonAction,
} from "@/features/members/actions";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function EditCoursePage({ params }: Props) {
  let course: Awaited<ReturnType<typeof getCourse>> = null;
  let lessons: Awaited<ReturnType<typeof listLessons>> = [];

  try {
    course = await getCourse(params.id);
    if (course) lessons = await listLessons(params.id);
  } catch {
    course = null;
  }

  if (!course) notFound();

  const boundUpdate = updateCourseAction.bind(null, course.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/members"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          コース一覧に戻る
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">コースを編集</h1>
          <DeleteCourseButton
            courseId={course.id}
            courseTitle={course.title}
            deleteAction={deleteCourseAction}
          />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">基本設定</h2>
        <CourseForm
          action={boundUpdate}
          defaultValues={course}
          submitLabel="保存する"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">
          レッスン一覧（{lessons.length} 件）
        </h2>
        <LessonEditor
          courseId={course.id}
          lessons={lessons}
          addAction={addLessonAction}
          updateAction={updateLessonAction}
          deleteAction={deleteLessonAction}
        />
      </section>
    </div>
  );
}
