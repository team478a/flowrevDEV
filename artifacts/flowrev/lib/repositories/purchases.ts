import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CreatePurchaseInput {
  clientId: string;
  whiteLabelId: string;
  customerId: string;
  productId: string;
  amount: number;
  currency?: string;
  stripeSessionId?: string;
}

export type PurchaseRow = {
  id: string;
  product_id: string | null;
  amount: number;
  currency: string;
  payment_status: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
};

/** 購入レコードを作成して ID を返す */
export async function createPurchase(
  input: CreatePurchaseInput,
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("purchases")
    .insert({
      client_id: input.clientId,
      white_label_id: input.whiteLabelId,
      customer_id: input.customerId,
      product_id: input.productId,
      amount: input.amount,
      currency: input.currency ?? "jpy",
      payment_method: "stripe",
      payment_status: "pending",
      stripe_session_id: input.stripeSessionId ?? null,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(`購入記録の作成に失敗: ${error.message}`);
  return (data as Record<string, unknown>).id as string;
}

/** Stripe Session ID を使って purchase を paid に更新する */
export async function markPurchasePaid(
  stripeSessionId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("purchases")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", stripeSessionId)
    .eq("payment_status", "pending");

  if (error) throw new Error(`購入ステータスの更新に失敗: ${error.message}`);
}

/** 指定顧客が paid 購入を持っているか確認する */
export async function hasPaidPurchase(
  customerId: string,
  clientId: string,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("purchases")
    .select("id")
    .eq("customer_id", customerId)
    .eq("client_id", clientId)
    .eq("payment_status", "paid")
    .limit(1)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

/** 顧客の購入履歴一覧を返す */
export async function getPurchasesByCustomer(
  customerId: string,
  clientId: string,
): Promise<PurchaseRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("purchases")
    .select(
      "id, product_id, amount, currency, payment_status, payment_method, paid_at, created_at",
    )
    .eq("customer_id", customerId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`購入履歴の取得に失敗: ${error.message}`);
  return (data ?? []) as PurchaseRow[];
}
