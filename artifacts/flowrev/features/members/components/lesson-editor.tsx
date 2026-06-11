"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LessonRow } from "@/lib/repositories/courses";
import type {
  addLessonAction,
  updateLessonAction,
  deleteLessonAction,
} from "@/features/members/actions";
import {
  LessonFormFields,
  emptyLessonForm,
  type LessonFormData,
} from "@/features/members/components/lesson-form-fields";

interface LessonEditorProps {
  courseId: string;
  lessons: LessonRow[];
  addAction: typeof addLessonAction;
  updateAction: typeof updateLessonAction;
  deleteAction: typeof deleteLessonAction;
}

const INITIAL_STATE = { error: null as string | null };

const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: "動画",
  text: "テキスト",
  file: "ファイル",
};

const VIDEO_TYPE_LABELS: Record<string, string> = {
  url: "外部URL",
  cloudflare: "☁ CF Stream",
};

function lessonToForm(lesson: LessonRow): LessonFormData {
  return {
    title: lesson.title,
    contentType: lesson.contentType,
    videoType: lesson.videoType ?? "url",
    videoUrl: lesson.videoUrl ?? "",
    cloudflareVideoId: lesson.cloudflareVideoId ?? "",
    textContent: lesson.textContent ?? "",
    fileUrl: lesson.fileUrl ?? "",
    durationSeconds: lesson.durationSeconds ? String(lesson.durationSeconds) : "",
    status: lesson.status,
  };
}

function buildFormData(values: LessonFormData): FormData {
  const fd = new FormData();
  fd.set("title", values.title);
  fd.set("contentType", values.contentType);
  fd.set("videoType", values.videoType);
  fd.set("videoUrl", values.videoUrl);
  fd.set("cloudflareVideoId", values.cloudflareVideoId);
  fd.set("textContent", values.textContent);
  fd.set("fileUrl", values.fileUrl);
  fd.set("durationSeconds", values.durationSeconds);
  fd.set("status", values.status);
  return fd;
}

export function LessonEditor({
  courseId,
  lessons,
  addAction,
  updateAction,
  deleteAction,
}: LessonEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<LessonFormData>(emptyLessonForm());
  const [editForm, setEditForm] = useState<LessonFormData>(emptyLessonForm());
  const [error, setError] = useState<string | null>(null);

  function handleAddField(field: keyof LessonFormData, value: string) {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditField(field: keyof LessonFormData, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAdd() {
    startTransition(async () => {
      const result = await addAction(courseId, INITIAL_STATE, buildFormData(addForm));
      if (result.error) {
        setError(result.error);
      } else {
        setAddForm(emptyLessonForm());
        setShowAddForm(false);
        setError(null);
        router.refresh();
      }
    });
  }

  function handleUpdate(lessonId: string) {
    startTransition(async () => {
      const result = await updateAction(
        lessonId,
        courseId,
        INITIAL_STATE,
        buildFormData(editForm),
      );
      if (result.error) {
        setError(result.error);
      } else {
        setEditingId(null);
        setError(null);
        router.refresh();
      }
    });
  }

  function handleDelete(lessonId: string) {
    startTransition(async () => {
      const result = await deleteAction(lessonId, courseId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {lessons.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground">
          まだレッスンがありません。追加してください。
        </p>
      )}

      {lessons.map((lesson, idx) => (
        <div key={lesson.id} className="border rounded-lg p-4 bg-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">
                #{idx + 1}
              </span>
              <Badge variant="outline" className="text-xs">
                {CONTENT_TYPE_LABELS[lesson.contentType] ?? lesson.contentType}
              </Badge>
              {lesson.contentType === "video" && (
                <Badge variant="secondary" className="text-xs">
                  {VIDEO_TYPE_LABELS[lesson.videoType ?? "url"] ?? lesson.videoType}
                </Badge>
              )}
              {lesson.status === "draft" && (
                <Badge variant="secondary" className="text-xs">下書き</Badge>
              )}
            </div>
            {editingId !== lesson.id && (
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditingId(lesson.id); setEditForm(lessonToForm(lesson)); setError(null); }}
                  disabled={isPending}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />編集
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(lesson.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />削除
                </Button>
              </div>
            )}
          </div>

          {editingId === lesson.id ? (
            <>
              <LessonFormFields values={editForm} onChange={handleEditField} />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => handleUpdate(lesson.id)} disabled={isPending}>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  {isPending ? "保存中…" : "保存"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)} disabled={isPending}>
                  <X className="h-3.5 w-3.5 mr-1" />キャンセル
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm font-medium">{lesson.title}</p>
          )}
        </div>
      ))}

      {showAddForm && (
        <div className="border border-dashed rounded-lg p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">新しいレッスンを追加</p>
          <LessonFormFields values={addForm} onChange={handleAddField} />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAdd} disabled={isPending}>
              {isPending ? "追加中…" : "追加する"}
            </Button>
            <Button type="button" variant="outline" size="sm"
              onClick={() => { setShowAddForm(false); setAddForm(emptyLessonForm()); setError(null); }}
              disabled={isPending}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => { setShowAddForm(true); setError(null); }}
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-1.5" />レッスンを追加
        </Button>
      )}
    </div>
  );
}
