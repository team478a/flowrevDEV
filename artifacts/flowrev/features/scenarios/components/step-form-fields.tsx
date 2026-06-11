"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiGenerateButton } from "@/features/ai/components/ai-generate-button";

export interface StepFormData {
  delayDays: string;
  channel: string;
  subject: string;
  body: string;
  scenarioName?: string;
}

export function emptyStepForm(): StepFormData {
  return { delayDays: "0", channel: "email", subject: "", body: "" };
}

interface StepFormFieldsProps {
  values: StepFormData;
  onChange: (field: keyof StepFormData, value: string) => void;
}

export function StepFormFields({ values, onChange }: StepFormFieldsProps) {
  const isLine = values.channel === "line";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>送信タイミング（日後）*</Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={values.delayDays}
            onChange={(e) => onChange("delayDays", e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>チャネル *</Label>
          <div className="flex gap-2">
            {(["email", "line"] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onChange("channel", ch)}
                className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  values.channel === ch
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {ch === "email" ? "📧 メール" : "💬 LINE"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isLine && (
        <div className="flex flex-col gap-1.5">
          <Label>件名</Label>
          <Input
            value={values.subject}
            onChange={(e) => onChange("subject", e.target.value)}
            placeholder="例：購入ありがとうございます"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label>本文 *</Label>
          <AiGenerateButton
            endpoint="/api/ai/generate-follow"
            buildPayload={() => ({
              subject: values.subject,
              scenarioName: values.scenarioName ?? "",
            })}
            onGenerated={(text) => onChange("body", text)}
          />
        </div>
        <Textarea
          value={values.body}
          onChange={(e) => onChange("body", e.target.value)}
          rows={5}
          placeholder={isLine ? "LINE メッセージ本文を入力してください" : "メール本文を入力してください"}
        />
        {isLine && (
          <p className="text-xs text-muted-foreground">
            💡 LINE はテキストのみ。顧客詳細画面で LINE ユーザー ID が設定されている顧客にのみ送信されます。
          </p>
        )}
      </div>
    </div>
  );
}
