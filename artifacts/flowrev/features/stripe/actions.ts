"use server";

import { getSessionProfile } from "@/features/auth/session";
import { redirect } from "next/navigation";
import { upsertStripeSettings } from "@/lib/repositories/stripe-settings";
import { getStripeClient } from "@/lib/stripe/client";

export interface StripeSettingsActionResult {
  error: string | null;
}

export async function saveStripeSettingsAction(
  formData: FormData,
): Promise<StripeSettingsActionResult> {
  const session = await getSessionProfile();
  if (!session || session.role !== "client_owner") redirect("/login");
  if (!session.clientId) {
    return { error: "クライアント情報が取得できません。" };
  }

  const secretKey = ((formData.get("secretKey") as string | null) ?? "").trim();
  const webhookSecret = (
    (formData.get("webhookSecret") as string | null) ?? ""
  ).trim();
  const isLive = formData.get("isLive") === "true";

  try {
    await upsertStripeSettings(session.clientId, {
      secretKey: secretKey || undefined,
      webhookSecret: webhookSecret || undefined,
      isLive,
    });
    return { error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存に失敗しました。";
    return { error: msg };
  }
}

export interface StripeTestResult {
  ok: boolean;
  error: string | null;
}

/** Stripe APIキーの疎通テストを実行する */
export async function testStripeConnectionAction(): Promise<StripeTestResult> {
  const session = await getSessionProfile();
  if (!session || session.role !== "client_owner") {
    return { ok: false, error: "権限がありません。" };
  }
  if (!session.clientId) {
    return { ok: false, error: "クライアント情報が取得できません。" };
  }

  const stripeResult = await getStripeClient(session.clientId).catch(() => null);
  if (!stripeResult) {
    return { ok: false, error: "Stripe キーが設定されていません。先に保存してください。" };
  }

  try {
    await stripeResult.stripe.balance.retrieve();
    return { ok: true, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "接続に失敗しました。";
    return { ok: false, error: msg };
  }
}
