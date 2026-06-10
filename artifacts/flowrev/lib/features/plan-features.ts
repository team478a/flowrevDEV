export const PLAN_FEATURE_DEFS = [
  { key: "lp_builder",    label: "LP管理",         description: "LP作成・公開機能" },
  { key: "member_site",   label: "会員サイト",       description: "コース・レッスン管理" },
  { key: "scenarios",     label: "フォローシナリオ", description: "メール自動化機能" },
  { key: "ai_generation", label: "AI生成",          description: "AIによるコンテンツ生成" },
  { key: "csv_export",    label: "CSVエクスポート",  description: "顧客データのエクスポート" },
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURE_DEFS)[number]["key"];
export type PlanFeatures = Partial<Record<PlanFeatureKey, boolean>>;

/**
 * 機能が有効かどうかを返す。
 * features に明示的に false が設定されている場合のみ無効。
 * 未設定 / plan_id 未割当の場合はデフォルト有効（既存クライアントの後方互換）。
 */
export function hasFeature(features: PlanFeatures, key: PlanFeatureKey): boolean {
  if (features[key] === false) return false;
  return true;
}
