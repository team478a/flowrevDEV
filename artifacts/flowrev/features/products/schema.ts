import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "商品名を入力してください。"),
  description: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .min(1, "価格を入力してください。")
    .pipe(
      z.coerce
        .number({ invalid_type_error: "価格は数値で入力してください。" })
        .int("価格は整数で入力してください。")
        .min(0, "価格は0以上で入力してください。"),
    ),
  priceType: z.enum(["one_time", "free"], {
    errorMap: () => ({ message: "価格タイプを選択してください。" }),
  }),
  category: z.string().trim().optional(),
  status: z.enum(["draft", "published", "archived"], {
    errorMap: () => ({ message: "ステータスを選択してください。" }),
  }),
});

export type ProductFormValues = z.infer<typeof productSchema>;
