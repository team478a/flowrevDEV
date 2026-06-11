"use client";

import { useState, useRef } from "react";
import * as tus from "tus-js-client";
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoUploaderProps {
  onUploadComplete: (videoId: string) => void;
  currentVideoId?: string;
  disabled?: boolean;
}

export function VideoUploader({
  onUploadComplete,
  currentVideoId,
  disabled,
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedId, setUploadedId] = useState(currentVideoId ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);
    setUploadedId("");

    try {
      const res = await fetch("/api/admin/video/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileSize: file.size, filename: file.name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "アップロード URL の取得に失敗しました。");
      }

      const { uploadUrl, videoId } = (await res.json()) as {
        uploadUrl: string;
        videoId: string;
      };

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          uploadUrl,
          chunkSize: 5 * 1024 * 1024,
          retryDelays: [0, 1000, 3000],
          onProgress(bytesUploaded, bytesTotal) {
            setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
          },
          onSuccess() {
            resolve();
          },
          onError(err) {
            reject(err);
          },
        });
        upload.start();
      });

      setUploading(false);
      setProgress(100);
      setUploadedId(videoId);
      onUploadComplete(videoId);
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : "アップロードに失敗しました。");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      {uploadedId && !uploading && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            動画 ID:{" "}
            <code className="font-mono text-xs">{uploadedId}</code>
          </span>
        </div>
      )}

      {currentVideoId && !uploadedId && !uploading && (
        <div className="text-xs text-muted-foreground">
          現在の動画 ID:{" "}
          <code className="font-mono">{currentVideoId}</code>
        </div>
      )}

      {uploading && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>アップロード中… {progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading || disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "アップロード中…" : uploadedId ? "動画を差し替える" : "動画をアップロード"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        動画ファイルを選択すると Cloudflare Stream に直接アップロードされます。
        大容量ファイル（数 GB）も対応しています。
      </p>
    </div>
  );
}
