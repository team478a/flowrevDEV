"use client";

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
import { CONTENT_TYPES } from "@/features/members/schema";

export interface LessonFormData {
  title: string;
  contentType: string;
  videoUrl: string;
  textContent: string;
  fileUrl: string;
  durationSeconds: string;
  status: string;
}

export function emptyLessonForm(): LessonFormData {
  return {
    title: "",
    contentType: "video",
    videoUrl: "",
    textContent: "",
    fileUrl: "",
    durationSeconds: "",
    status: "published",
  };
}

interface LessonFormFieldsProps {
  values: LessonFormData;
  onChange: (field: keyof LessonFormData, value: string) => void;
}

export function LessonFormFields({ values, onChange }: LessonFormFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>レッスンタイトル *</Label>
          <Input
            value={values.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="例：第1回 導入"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>コンテンツタイプ *</Label>
          <Select
            value={values.contentType}
            onValueChange={(v) => onChange("contentType", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {values.contentType === "video" && (
        <div className="flex flex-col gap-1.5">
          <Label>動画 URL</Label>
          <Input
            type="url"
            value={values.videoUrl}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      {values.contentType === "text" && (
        <div className="flex flex-col gap-1.5">
          <Label>テキスト本文</Label>
          <Textarea
            value={values.textContent}
            onChange={(e) => onChange("textContent", e.target.value)}
            rows={6}
            placeholder="レッスン本文を入力してください"
          />
        </div>
      )}

      {values.contentType === "file" && (
        <div className="flex flex-col gap-1.5">
          <Label>ファイル URL</Label>
          <Input
            type="url"
            value={values.fileUrl}
            onChange={(e) => onChange("fileUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>再生時間（秒）</Label>
          <Input
            type="number"
            min={0}
            value={values.durationSeconds}
            onChange={(e) => onChange("durationSeconds", e.target.value)}
            placeholder="例：600"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>ステータス *</Label>
          <Select
            value={values.status}
            onValueChange={(v) => onChange("status", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">公開</SelectItem>
              <SelectItem value="draft">下書き</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
