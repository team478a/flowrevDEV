import { createAdminClient } from "@/lib/supabase/admin";

export interface PlanOption {
  id: string;
  name: string;
  priceMonthly: number;
}

/**
 * プラン一覧を取得する（管理者クライアント）。
 * プラン未登録なら空配列を返す。
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
