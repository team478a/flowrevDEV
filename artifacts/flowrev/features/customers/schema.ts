import { z } from "zod";

export const SOURCE_OPTIONS = [
  { value: "manual", label: "手動登録" },
  { value: "lp", label: "LPから" },
  { value: "import", label: "インポート" },
] as const;

export const STATUS_OPTIONS = [
  { value: "active", label: "アクティブ" },
  { value: "inactive", label: "無効" },
] as const;

export const customerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "メールアドレスを入力してください。")
    .email("有効なメールアドレスを入力してください。"),
  name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  source: z.enum(["manual", "lp", "import"], {
    errorMap: () => ({ message: "登録元を選択してください。" }),
  }),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "ステータスを選択してください。" }),
  }),
  /** フォームでは「,」区切りの文字列で受け取り、配列に変換する */
  tagsRaw: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

/** カンマ区切り文字列 → タグ配列（空文字除去・重複除去） */
export function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ];
}
