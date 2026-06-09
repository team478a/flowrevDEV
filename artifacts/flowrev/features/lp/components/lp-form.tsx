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
import type { LpActionState } from "@/features/lp/actions";
import type { LandingPageRow } from "@/lib/repositories/landing-pages";
import type { ProductRow } from "@/lib/repositories/products";

interface LpFormProps {
  action: (prev: LpActionState, formData: FormData) => Promise<LpActionState>;
  defaultValues?: Partial<LandingPageRow>;
  products: Pick<ProductRow, "id" | "name">[];
  submitLabel: string;
  successPath?: string;
}

const initialState: LpActionState = { error: null, success: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中…" : label}
    </Button>
  );
}

export function LpForm({
  action,
  defaultValues,
  products,
  submitLabel,
  successPath,
}: LpFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.success === true && successPath) {
      router.push(successPath);
    }
  }, [state.success, router, successPath]);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-2xl">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          name="title"
          placeholder="例：無料相談申し込みページ"
          defaultValue={defaultValues?.title ?? ""}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">
          スラッグ *
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            （公開URL: /p/スラッグ）
          </span>
        </Label>
        <Input
          id="slug"
          name="slug"
          placeholder="例：free-consultation"
          defaultValue={defaultValues?.slug ?? ""}
          required
        />
        <p className="text-xs text-muted-foreground">
          半角英数字とハイフンのみ使用できます
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="productId">紐付け商品（任意）</Label>
        <Select
          name="productId"
          defaultValue={defaultValues?.productId ?? "none"}
        >
          <SelectTrigger id="productId">
            <SelectValue placeholder="商品を選択（任意）" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">紐付けなし</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="htmlContent">HTML本文</Label>
        <Textarea
          id="htmlContent"
          name="htmlContent"
          placeholder="<h1>見出し</h1><p>本文</p>"
          rows={12}
          defaultValue={defaultValues?.htmlContent ?? ""}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          HTMLタグを直接入力できます
        </p>
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
