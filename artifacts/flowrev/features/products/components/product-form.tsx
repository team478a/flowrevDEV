"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductActionState } from "@/features/products/actions";
import type { ProductRow } from "@/lib/repositories/products";

interface ProductFormProps {
  action: (
    prev: ProductActionState,
    formData: FormData,
  ) => Promise<ProductActionState>;
  defaultValues?: Partial<ProductRow>;
  submitLabel: string;
  successPath?: string;
}

const initialState: ProductActionState = { error: null, success: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中…" : label}
    </Button>
  );
}

export function ProductForm({
  action,
  defaultValues,
  submitLabel,
  successPath,
}: ProductFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.success === true && successPath) {
      router.push(successPath);
    }
  }, [state.success, router, successPath]);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">商品名 *</Label>
        <Input
          id="name"
          name="name"
          placeholder="例：コンサルティング基礎コース"
          defaultValue={defaultValues?.name ?? ""}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="商品の説明を入力してください"
          rows={4}
          defaultValue={defaultValues?.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">価格（円）*</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            placeholder="0"
            defaultValue={defaultValues?.price ?? 0}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="priceType">価格タイプ *</Label>
          <Select
            name="priceType"
            defaultValue={defaultValues?.priceType ?? "one_time"}
          >
            <SelectTrigger id="priceType">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one_time">一括払い</SelectItem>
              <SelectItem value="free">無料</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">カテゴリ</Label>
        <Input
          id="category"
          name="category"
          placeholder="例：コンサルティング・コーチング"
          defaultValue={defaultValues?.category ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">ステータス *</Label>
        <Select
          name="status"
          defaultValue={defaultValues?.status ?? "draft"}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">下書き</SelectItem>
            <SelectItem value="published">公開</SelectItem>
            <SelectItem value="archived">アーカイブ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
