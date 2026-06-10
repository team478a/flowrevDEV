"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, Loader2, ChevronLeft } from "lucide-react";
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
import type { ProductRow } from "@/lib/repositories/products";

type Product = Pick<ProductRow, "id" | "name">;

interface LpEasyWizardProps {
  action: (prev: LpActionState, formData: FormData) => Promise<LpActionState>;
  products: Product[];
}

function toSlug(text: string): string {
  const ts = Date.now().toString(36);
  const ascii = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return ascii.length > 2 ? `${ascii.slice(0, 24)}-${ts}` : `lp-${ts}`;
}

function buildPreviewDoc(html: string): string {
  return `<!DOCTYPE html><html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
margin:0;padding:24px;color:#1a1a1a;line-height:1.7;font-size:15px;}
h1,h2,h3{line-height:1.3;margin-top:1.5em;margin-bottom:.5em;}
h1{font-size:1.8em;}h2{font-size:1.4em;}p{margin:0 0 1em;}
img{max-width:100%;height:auto;}a{color:#3b82f6;}ul,ol{padding-left:1.5em;}
</style></head><body>${html}</body></html>`;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? <><Loader2 className="h-4 w-4 animate-spin" />保存中…</> : "このLPを作成する"}
    </Button>
  );
}

export function LpEasyWizard({ action, products }: LpEasyWizardProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, { error: null });

  const [purpose, setPurpose] = useState("");
  const [target, setTarget] = useState("");
  const [productId, setProductId] = useState("none");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    if (!purpose.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);

    const selectedProduct = products.find((p) => p.id === productId);
    try {
      const res = await fetch("/api/ai/generate-lp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${purpose}${target ? `（ターゲット：${target}）` : ""}`,
          productName: selectedProduct?.name ?? "",
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || data.error) {
        setGenerateError(data.error ?? "生成に失敗しました。");
        return;
      }
      if (data.text) {
        setGeneratedHtml(data.text);
        if (!title) setTitle(purpose.slice(0, 50));
        if (!slug) setSlug(toSlug(purpose));
        setGenerated(true);
      }
    } catch {
      setGenerateError("ネットワークエラーが発生しました。");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Step 1：情報入力 */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
          LP の目的を入力する
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ez-purpose">
            何のLPを作りますか？ <span className="text-red-500 text-xs">必須</span>
          </Label>
          <Textarea
            id="ez-purpose"
            placeholder="例：無料体験セミナーの参加者を集める"
            rows={3}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ez-target">ターゲット（任意）</Label>
          <Input
            id="ez-target"
            placeholder="例：副業を始めたい30代の会社員"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ez-product">紐付ける商品（任意）</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger id="ez-product">
              <SelectValue placeholder="商品を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">紐付けなし</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {generateError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {generateError}
          </p>
        )}

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={!purpose.trim() || isGenerating}
          className="gap-2 self-start"
        >
          {isGenerating
            ? <><Loader2 className="h-4 w-4 animate-spin" />生成中…</>
            : <><Sparkles className="h-4 w-4" />{generated ? "再生成する" : "AIでLP全体を生成する"}</>}
        </Button>
      </section>

      {/* Step 2：プレビュー＋保存（生成後に表示） */}
      {generated && (
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
            確認・保存する
          </div>

          {/* プレビュー */}
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
              <Eye className="h-3 w-3" /> プレビュー
            </p>
            <div className="rounded-md border border-border overflow-hidden bg-white">
              <iframe
                srcDoc={buildPreviewDoc(generatedHtml)}
                className="w-full"
                style={{ height: "360px" }}
                sandbox="allow-same-origin"
                title="生成されたLPのプレビュー"
              />
            </div>
          </div>

          {/* 保存フォーム */}
          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {state.error}
            </p>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="htmlContent" value={generatedHtml} />
            <input type="hidden" name="productId" value={productId} />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ez-title">LPタイトル <span className="text-red-500 text-xs">必須</span></Label>
              <Input id="ez-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ez-slug">
                スラッグ <span className="text-red-500 text-xs">必須</span>
                <span className="ml-2 text-xs text-muted-foreground font-normal">（公開URL: /p/スラッグ）</span>
              </Label>
              <Input id="ez-slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ez-status">公開設定</Label>
              <Select name="status" defaultValue="draft">
                <SelectTrigger id="ez-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">下書き（後で公開）</SelectItem>
                  <SelectItem value="published">今すぐ公開</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <SaveButton />
              <Button type="button" variant="outline" onClick={() => router.back()}>
                キャンセル
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
