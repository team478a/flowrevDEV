import { z } from "zod";

export const CONTENT_TYPES = [
  { value: "video", label: "動画" },
  { value: "text", label: "テキスト" },
  { value: "file", label: "ファイル" },
] as const;

export const courseSchema = z.object({
  title: z.string().trim().min(1, "コースタイトルを入力してください。"),
  description: z.string().trim().optional(),
  status: z.enum(["draft", "published"], {
    errorMap: () => ({ message: "ステータスを選択してください。" }),
  }),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(1, "レッスンタイトルを入力してください。"),
  contentType: z.enum(["video", "text", "file"], {
    errorMap: () => ({ message: "コンテンツタイプを選択してください。" }),
  }),
  videoUrl: z.string().trim().optional(),
  textContent: z.string().trim().optional(),
  fileUrl: z.string().trim().optional(),
  durationSeconds: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(
      z.number().int().min(0).optional(),
    ),
  status: z.enum(["published", "draft"], {
    errorMap: () => ({ message: "ステータスを選択してください。" }),
  }),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
export type LessonFormValues = z.infer<typeof lessonSchema>;
