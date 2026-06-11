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
import { VideoUploader } from "@/features/members/components/video-uploader";

export interface LessonFormData {
  title: string;
  contentType: string;
  videoType: string;
  videoUrl: string;
  cloudflareVideoId: string;
  textContent: string;
  fileUrl: string;
  durationSeconds: string;
  status: string;
}

export function emptyLessonForm(): LessonFormData {
  return {
    title: "",
    contentType: "video",
    videoType: "url",
    videoUrl: "",
    cloudflareVideoId: "",
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
  const isVideo = values.contentType === "video";
  const isCloudflare = isVideo && values.videoType === "cloudflare";

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

      {isVideo && (
        <div className="flex flex-col gap-2">
          <Label>動画ソース</Label>
          <div className="flex gap-2">
            {(["url", "cloudflare"] as const).map((vt) => (
              <button
                key={vt}
                type="button"
                onClick={() => onChange("videoType", vt)}
                className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  values.videoType === vt
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {vt === "url" ? "🔗 外部 URL" : "☁ Cloudflare Stream"}
              </button>
            ))}
          </div>
        </div>
      )}

      {isVideo && !isCloudflare && (
        <div className="flex flex-col gap-1.5">
          <Label>動画 URL（YouTube / Vimeo など）</Label>
          <Input
            type="url"
            value={values.videoUrl}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            placeholder="https://www.youtube.com/embed/... または https://player.vimeo.com/video/..."
          />
          <p className="text-xs text-muted-foreground">
            YouTube・Vimeo の埋め込み URL（embed 形式）を入力してください。
          </p>
        </div>
      )}

      {isVideo && isCloudflare && (
        <div className="flex flex-col gap-1.5">
          <Label>Cloudflare Stream 動画</Label>
          <VideoUploader
            currentVideoId={values.cloudflareVideoId || undefined}
            onUploadComplete={(videoId) => onChange("cloudflareVideoId", videoId)}
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
