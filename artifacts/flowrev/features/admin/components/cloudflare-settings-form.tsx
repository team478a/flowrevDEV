"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { CloudflareSettingsMasked } from "@/lib/repositories/cloudflare-settings";

interface CloudflareSettingsFormProps {
  current: CloudflareSettingsMasked | null;
  action: (
    prev: { error: string | null; success?: boolean },
    formData: FormData,
  ) => Promise<{ error: string | null; success?: boolean }>;
}

const initialState = { error: null as string | null, success: false };

export function CloudflareSettingsForm({
  current,
  action,
}: CloudflareSettingsFormProps) {
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [, startTransition] = useTransition();
  const [state, formAction] = useFormState(action, initialState);

  void startTransition;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="accountId">
          Cloudflare アカウント ID
          {current?.accountId && (
            <span className="ml-2 text-xs text-green-600">（設定済み）</span>
          )}
        </Label>
        <Input
          id="accountId"
          name="accountId"
          placeholder={current?.accountId ?? "例: 1a2b3c4d5e6f7890abcdef1234567890"}
          defaultValue={current?.accountId ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Cloudflare ダッシュボードの右サイドバーに表示されるアカウント ID
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="apiToken">
          API トークン（Stream 権限）
          {current?.hasApiToken && (
            <span className="ml-2 text-xs text-green-600">（設定済み）</span>
          )}
        </Label>
        <div className="relative">
          <Input
            id="apiToken"
            name="apiToken"
            type={showToken ? "text" : "password"}
            placeholder={current?.hasApiToken ? "変更する場合のみ入力" : "Cloudflare Stream API トークン"}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowToken((v) => !v)}
            tabIndex={-1}
          >
            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cloudflare Stream テンプレートで作成した API トークン（暗号化保存されます）
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="webhookSecret">
          Webhook シークレット
          {current?.hasWebhookSecret && (
            <span className="ml-2 text-xs text-green-600">（設定済み）</span>
          )}
        </Label>
        <div className="relative">
          <Input
            id="webhookSecret"
            name="webhookSecret"
            type={showSecret ? "text" : "password"}
            placeholder={current?.hasWebhookSecret ? "変更する場合のみ入力" : "Cloudflare Stream Webhook シークレット"}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowSecret((v) => !v)}
            tabIndex={-1}
          >
            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cloudflare Stream の Webhooks 画面で発行したシークレット（暗号化保存されます）
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>設定を保存しました。</span>
        </div>
      )}

      <div>
        <Button type="submit">保存する</Button>
      </div>
    </form>
  );
}
