import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AiSettingsForm } from "@/features/admin/components/ai-settings-form";
import {
  getHqAiSettingMasked,
  upsertHqAiSetting,
} from "@/lib/repositories/ai-settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/features/auth/session";

export const dynamic = "force-dynamic";

async function saveAiSettingAction(
  _prev: { error: string | null; success?: boolean },
  formData: FormData,
): Promise<{ error: string | null; success?: boolean }> {
  "use server";
  const session = await getSessionProfile();
  if (session?.role !== "system_admin")
    return { error: "この操作を行う権限がありません。" };

  const apiKey = (formData.get("apiKey") as string | null)?.trim() ?? "";
  const model = (formData.get("model") as string | null)?.trim() ?? "";

  const current = await getHqAiSettingMasked("anthropic");

  if (!apiKey && !current?.hasApiKey)
    return { error: "API キーを入力してください。" };

  try {
    if (apiKey) {
      await upsertHqAiSetting({ provider: "anthropic", apiKey, model: model || undefined });
    } else {
      // キーはそのまま。モデルのみ更新する
      const supabase = createAdminClient();
      await supabase
        .from("ai_provider_settings")
        .update({ model: model || null, updated_at: new Date().toISOString() })
        .eq("provider", "anthropic")
        .is("white_label_id", null);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存に失敗しました。" };
  }

  revalidatePath("/admin/settings/ai");
  return { error: null, success: true };
}

export default async function AiSettingsPage() {
  const current = await getHqAiSettingMasked("anthropic");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 管理ダッシュボード
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          AI設定（Anthropic）
        </h1>
        <p className="text-sm text-muted-foreground">
          文章生成に使う Anthropic API キーを設定します。暗号化して保存されます。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <AiSettingsForm
          current={current}
          action={saveAiSettingAction}
          keyLabel="Anthropic API キー"
          keyPlaceholder="sk-ant-..."
          modelPlaceholder="claude-haiku-4-5-20251001"
        />
      </div>
    </div>
  );
}
