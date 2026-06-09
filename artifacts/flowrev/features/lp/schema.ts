import { z } from "zod";

export const lpSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください。"),
  slug: z
    .string()
    .trim()
    .min(1, "スラッグを入力してください。")
    .regex(
      /^[a-z0-9-]+$/,
      "スラッグは半角英数字とハイフンのみ使用できます。",
    ),
  productId: z.string().uuid().optional().or(z.literal("")),
  htmlContent: z.string().trim().optional(),
  status: z.enum(["draft", "published", "archived"], {
    errorMap: () => ({ message: "ステータスを選択してください。" }),
  }),
});

export type LpFormValues = z.infer<typeof lpSchema>;
