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
import type { CustomerActionState } from "@/features/customers/actions";
import type { CustomerRow } from "@/lib/repositories/customers";
import { SOURCE_OPTIONS, STATUS_OPTIONS } from "@/features/customers/schema";

interface CustomerFormProps {
  action: (
    prev: CustomerActionState,
    formData: FormData,
  ) => Promise<CustomerActionState>;
  defaultValues?: Partial<CustomerRow>;
  submitLabel: string;
  successPath?: string;
}

const initialState: CustomerActionState = { error: null, success: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中…" : label}
    </Button>
  );
}

export function CustomerForm({
  action,
  defaultValues,
  submitLabel,
  successPath,
}: CustomerFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.success === true && successPath) {
      router.push(successPath);
    }
  }, [state.success, router, successPath]);

  const tagsDefault = (defaultValues?.tags ?? []).join(", ");

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">メールアドレス *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="example@email.com"
          defaultValue={defaultValues?.email ?? ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">氏名</Label>
          <Input
            id="name"
            name="name"
            placeholder="山田 太郎"
            defaultValue={defaultValues?.name ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">電話番号</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="090-0000-0000"
            defaultValue={defaultValues?.phone ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source">登録元 *</Label>
          <Select
            name="source"
            defaultValue={defaultValues?.source ?? "manual"}
          >
            <SelectTrigger id="source">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">ステータス *</Label>
          <Select
            name="status"
            defaultValue={defaultValues?.status ?? "active"}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tagsRaw">タグ</Label>
        <Input
          id="tagsRaw"
          name="tagsRaw"
          placeholder="例：VIP, 購入済み（カンマ区切り）"
          defaultValue={tagsDefault}
        />
        <p className="text-xs text-muted-foreground">
          複数のタグはカンマ（,）で区切って入力してください。
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">メモ</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="顧客に関するメモを入力してください"
          rows={4}
          defaultValue={defaultValues?.notes ?? ""}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
