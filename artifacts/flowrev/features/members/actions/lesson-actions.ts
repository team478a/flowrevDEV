"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/features/auth/session";
import {
  addLesson,
  updateLesson,
  deleteLesson,
  getCourse,
} from "@/lib/repositories/courses";
import { lessonSchema } from "@/features/members/schema";
import type { MemberActionState } from "@/features/members/types";

export type { MemberActionState };

/** レッスン追加 */
export async function addLessonAction(
  courseId: string,
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };
  if (!session.whiteLabelId || !session.clientId)
    return { error: "クライアント情報が取得できませんでした。" };

  const existing = await getCourse(courseId);
  if (!existing) return { error: "コースが見つかりません。" };

  const videoType = ((formData.get("videoType") as string | null) ?? "url").trim() || "url";
  const cloudflareVideoId = ((formData.get("cloudflareVideoId") as string | null) ?? "").trim();

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    contentType: formData.get("contentType"),
    videoUrl: formData.get("videoUrl") || undefined,
    textContent: formData.get("textContent") || undefined,
    fileUrl: formData.get("fileUrl") || undefined,
    durationSeconds: formData.get("durationSeconds") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    await addLesson({
      whiteLabelId: session.whiteLabelId,
      clientId: session.clientId,
      courseId,
      title: parsed.data.title,
      contentType: parsed.data.contentType,
      videoType,
      videoUrl: parsed.data.videoUrl,
      cloudflareVideoId: cloudflareVideoId || undefined,
      textContent: parsed.data.textContent,
      fileUrl: parsed.data.fileUrl,
      durationSeconds: parsed.data.durationSeconds,
      status: parsed.data.status,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "追加に失敗しました。" };
  }

  revalidatePath(`/members/${courseId}`);
  return { error: null, success: true };
}

/** レッスン更新 */
export async function updateLessonAction(
  lessonId: string,
  courseId: string,
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  const videoType = ((formData.get("videoType") as string | null) ?? "url").trim() || "url";
  const cloudflareVideoId = ((formData.get("cloudflareVideoId") as string | null) ?? "").trim();

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    contentType: formData.get("contentType"),
    videoUrl: formData.get("videoUrl") || undefined,
    textContent: formData.get("textContent") || undefined,
    fileUrl: formData.get("fileUrl") || undefined,
    durationSeconds: formData.get("durationSeconds") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    await updateLesson(lessonId, {
      title: parsed.data.title,
      contentType: parsed.data.contentType,
      videoType,
      videoUrl: parsed.data.videoUrl ?? null,
      cloudflareVideoId: cloudflareVideoId || null,
      textContent: parsed.data.textContent ?? null,
      fileUrl: parsed.data.fileUrl ?? null,
      durationSeconds: parsed.data.durationSeconds ?? null,
      status: parsed.data.status,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新に失敗しました。" };
  }

  revalidatePath(`/members/${courseId}`);
  return { error: null, success: true };
}

/** レッスン削除 */
export async function deleteLessonAction(
  lessonId: string,
  courseId: string,
): Promise<MemberActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  try {
    await deleteLesson(lessonId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath(`/members/${courseId}`);
  return { error: null, success: true };
}
