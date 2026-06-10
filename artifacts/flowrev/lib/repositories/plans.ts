import { createAdminClient } from "@/lib/supabase/admin";

export interface PlanOption {
  id: string;
  name: string;
  priceMonthly: number;
}

export interface PlanRow {
  id: string;
  name: string;
  maxClients: number;
  maxProducts: number;
  maxCustomers: number;
  priceMonthly: number;
  createdAt: string | null;
}

export interface CreatePlanInput {
  name: string;
  maxClients: number;
  maxProducts: number;
  maxCustomers: number;
  priceMonthly: number;
}

/**
 * プラン一覧を取得する（管理者クライアント）。
 * ホワイトラベル作成フォームの選択肢用。プラン未登録なら空配列を返す。
 */
export async function listPlans(): Promise<PlanOption[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("plans")
    .select("id, name, price_monthly")
    .order("price_monthly", { ascending: true });

  if (error) {
    throw new Error(`プランの取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    priceMonthly: (p.price_monthly as number) ?? 0,
  }));
}

/**
 * プラン一覧を詳細項目つきで取得する（管理画面の一覧表示用）。
 */
export async function listPlansFull(): Promise<PlanRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("plans")
    .select(
      "id, name, max_clients, max_products, max_customers, price_monthly, created_at",
    )
    .order("price_monthly", { ascending: true });

  if (error) {
    throw new Error(`プランの取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    maxClients: (p.max_clients as number) ?? 0,
    maxProducts: (p.max_products as number) ?? 0,
    maxCustomers: (p.max_customers as number) ?? 0,
    priceMonthly: (p.price_monthly as number) ?? 0,
    createdAt: (p.created_at as string) ?? null,
  }));
}

/**
 * WL オーナー自身のプラン一覧を取得する。
 */
export async function listWLPlans(whiteLabelId: string): Promise<PlanOption[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("plans")
    .select("id, name, price_monthly")
    .eq("white_label_id", whiteLabelId)
    .order("price_monthly", { ascending: true });

  if (error) {
    throw new Error(`プランの取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    priceMonthly: (p.price_monthly as number) ?? 0,
  }));
}

/**
 * WL オーナー自身のプラン一覧を詳細項目つきで取得する（一覧表示用）。
 */
export async function listWLPlansFull(whiteLabelId: string): Promise<PlanRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("plans")
    .select("id, name, max_clients, max_products, max_customers, price_monthly, created_at")
    .eq("white_label_id", whiteLabelId)
    .order("price_monthly", { ascending: true });

  if (error) {
    throw new Error(`プランの取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    maxClients: (p.max_clients as number) ?? 0,
    maxProducts: (p.max_products as number) ?? 0,
    maxCustomers: (p.max_customers as number) ?? 0,
    priceMonthly: (p.price_monthly as number) ?? 0,
    createdAt: (p.created_at as string) ?? null,
  }));
}

/**
 * WL オーナー用プランを作成する（white_label_id を紐付け）。
 */
export async function createWLPlan(
  whiteLabelId: string,
  input: CreatePlanInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("plans")
    .insert({
      name: input.name,
      max_clients: input.maxClients,
      max_products: input.maxProducts,
      max_customers: input.maxCustomers,
      price_monthly: input.priceMonthly,
      white_label_id: whiteLabelId,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`プランの作成に失敗しました: ${error?.message ?? "不明なエラー"}`);
  }

  return { id: data.id as string };
}

/**
 * プランを作成する（管理者クライアント）。
 */
export async function createPlan(
  input: CreatePlanInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("plans")
    .insert({
      name: input.name,
      max_clients: input.maxClients,
      max_products: input.maxProducts,
      max_customers: input.maxCustomers,
      price_monthly: input.priceMonthly,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `プランの作成に失敗しました: ${error?.message ?? "不明なエラー"}`,
    );
  }

  return { id: data.id as string };
}
