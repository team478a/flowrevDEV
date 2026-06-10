import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanFeatures } from "./plan-features";

/**
 * clientId からそのクライアントのプラン機能フラグを取得する（サーバー専用）。
 * React cache() でリクエストスコープのメモ化 →
 * layout と page が同一リクエストで呼んでも DB アクセスは1回だけ。
 * plan_id 未設定なら空オブジェクトを返す（hasFeature がデフォルト有効を返す）。
 */
export const getClientPlanFeatures = cache(async (clientId: string): Promise<PlanFeatures> => {
  const admin = createAdminClient();

  const { data: clientRow } = await admin
    .from("clients")
    .select("plan_id")
    .eq("id", clientId)
    .maybeSingle();

  if (!clientRow?.plan_id) return {};

  const { data: planRow } = await admin
    .from("plans")
    .select("features")
    .eq("id", clientRow.plan_id as string)
    .maybeSingle();

  if (!planRow?.features) return {};
  return planRow.features as PlanFeatures;
});
