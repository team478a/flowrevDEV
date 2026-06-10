"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/repositories/courses";
import { courseSchema } from "@/features/members/schema";
import type { MemberActionState } from "@/features/members/types";

export type { MemberActionState };

/** コース作成 */
export async function createCourseAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };
  if (!session.clientId || !session.whiteLabelId)
    return { error: "クライアント情報が取得できませんでした。" };

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    const course = await createCourse({
      whiteLabelId: session.whiteLabelId,
      clientId: session.clientId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
    });
    revalidatePath("/members");
    redirect(`/members/${course.id}`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    return { error: e instanceof Error ? e.message : "作成に失敗しました。" };
  }
}

/** コース更新 */
export async function updateCourseAction(
  id: string,
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    await updateCourse(id, {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新に失敗しました。" };
  }

  revalidatePath("/members");
  revalidatePath(`/members/${id}`);
  return { error: null, success: true };
}

/** コース削除 */
export async function deleteCourseAction(
  id: string,
): Promise<MemberActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  try {
    await deleteCourse(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath("/members");
  redirect("/members");
}
