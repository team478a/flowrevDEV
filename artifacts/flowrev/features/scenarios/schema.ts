import { z } from "zod";

export const TRIGGER_TYPES = [
  { value: "manual", label: "手動" },
  { value: "purchase", label: "購入後" },
  { value: "no_action", label: "未アクション" },
  { value: "course_complete", label: "コース完了後" },
] as const;

export const scenarioSchema = z.object({
  name: z.string().trim().min(1, "シナリオ名を入力してください。"),
  triggerType: z.enum(["manual", "purchase", "no_action", "course_complete"], {
    errorMap: () => ({ message: "トリガーを選択してください。" }),
  }),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "ステータスを選択してください。" }),
  }),
});

export const stepSchema = z.object({
  delayDays: z
    .string()
    .trim()
    .pipe(
      z.coerce
        .number({ invalid_type_error: "日数は数値で入力してください。" })
        .int("日数は整数で入力してください。")
        .min(0, "日数は0以上で入力してください。"),
    ),
  subject: z.string().trim().optional(),
  body: z.string().trim().min(1, "本文を入力してください。"),
});

export type ScenarioFormValues = z.infer<typeof scenarioSchema>;
export type StepFormValues = z.infer<typeof stepSchema>;
