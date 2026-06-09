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
import type { MemberActionState } from "@/features/members/actions";
import type { CourseRow } from "@/lib/repositories/courses";

interface CourseFormProps {
  action: (
    prev: MemberActionState,
    formData: FormData,
  ) => Promise<MemberActionState>;
  defaultValues?: Partial<CourseRow>;
  submitLabel: string;
  successPath?: string;
}

const initialState: MemberActionState = { error: null, success: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中…" : label}
    </Button>
  );
}

export function CourseForm({
  action,
  defaultValues,
  submitLabel,
  successPath,
}: CourseFormProps) {
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
        <Label htmlFor="title">コースタイトル *</Label>
        <Input
          id="title"
          name="title"
          placeholder="例：マーケティング基礎コース"
          defaultValue={defaultValues?.title ?? ""}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="コースの内容・学習目標を入力してください"
          rows={4}
          defaultValue={defaultValues?.description ?? ""}
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
          </SelectContent>
        </Select>
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
