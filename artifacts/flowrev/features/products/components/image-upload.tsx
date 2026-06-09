"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadImageState } from "@/features/products/actions";

interface ImageUploadProps {
  productId: string;
  currentSignedUrl: string | null;
  /** productId は bind 済みのため引数不要 */
  uploadAction: (
    prev: UploadImageState,
    formData: FormData,
  ) => Promise<UploadImageState>;
}

const INITIAL: UploadImageState = { error: null, signedUrl: null };

export function ImageUpload({
  productId,
  currentSignedUrl,
  uploadAction,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(currentSignedUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [state, setState] = useState<UploadImageState>(INITIAL);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setLocalPreview(URL.createObjectURL(file));
    setState(INITIAL);
  }

  function handleCancel() {
    setSelectedFile(null);
    setLocalPreview(null);
    setState(INITIAL);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleUpload() {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("image", selectedFile);

    startTransition(async () => {
      const result = await uploadAction(INITIAL, formData);
      setState(result);
      if (result.signedUrl) {
        setDisplayUrl(result.signedUrl);
        setSelectedFile(null);
        setLocalPreview(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  const previewSrc = localPreview ?? displayUrl;

  return (
    <div className="flex flex-col gap-3 max-w-xs">
      {/* 画像プレビュー */}
      <div
        className="relative w-48 h-48 border-2 border-dashed rounded-lg overflow-hidden flex items-center justify-center bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={() => !isPending && inputRef.current?.click()}
      >
        {isPending ? (
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        ) : previewSrc ? (
          <Image
            src={previewSrc}
            alt="サムネイル"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
            <span className="text-xs">クリックして選択</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />

      {/* ファイル未選択 */}
      {!selectedFile && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
        >
          画像を選択
        </Button>
      )}

      {/* ファイル選択後：確認してからアップロード */}
      {selectedFile && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground truncate max-w-[12rem]">
            {selectedFile.name}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleUpload}
              disabled={isPending}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {isPending ? "アップロード中…" : "アップロード"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state.signedUrl && (
        <p className="text-xs text-green-600">✓ アップロード完了</p>
      )}

      <p className="text-xs text-muted-foreground">
        JPG・PNG・WebP、最大 5MB
      </p>
    </div>
  );
}
