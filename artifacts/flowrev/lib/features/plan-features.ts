// ============================================================
// 機能フラグ定義
// ============================================================
// 新機能を追加する手順:
//   1. PLAN_FEATURE_DEFS に { key, label, description, category } を追加
//   2. PLAN_FEATURE_CATEGORIES の該当カテゴリの features 配列に key を追加
//      （新カテゴリが必要な場合は PLAN_FEATURE_CATEGORIES にも追加）
//   3. ゲートが必要なページ/コンポーネントで hasFeature() を呼ぶ
//   4. ナビに表示する場合は app/(dashboard)/layout.tsx の NAV_DEFS に featureKey を設定
// ============================================================

export const PLAN_FEATURE_DEFS = [
  // ── コンテンツ・会員管理 ───────────────────────────────────
  {
    key: "lp_builder",
    label: "LP管理",
    description: "LP作成・公開機能",
    category: "content",
  },
  {
    key: "member_site",
    label: "会員サイト",
    description: "コース・レッスン・進捗管理",
    category: "content",
  },
  // ── マーケティング・顧客管理 ──────────────────────────────
  {
    key: "scenarios",
    label: "フォローシナリオ",
    description: "メール自動化・ステップ配信",
    category: "marketing",
  },
  {
    key: "csv_export",
    label: "CSVエクスポート",
    description: "顧客データの一括ダウンロード",
    category: "marketing",
  },
  // ── AI・生産性 ─────────────────────────────────────────────
  {
    key: "ai_generation",
    label: "AI生成",
    description: "商品説明・LP・メール文章のAI自動生成",
    category: "ai",
  },
  // ── 将来追加予定の機能はここに追記 ─────────────────────────
  // {
  //   key: "email_broadcast",
  //   label: "一斉配信",
  //   description: "複数顧客への同時メール送信",
  //   category: "marketing",
  // },
  // {
  //   key: "api_access",
  //   label: "API連携",
  //   description: "外部システムとのWebhook・API連携",
  //   category: "advanced",
  // },
  // {
  //   key: "analytics",
  //   label: "アクセス解析",
  //   description: "LP・会員サイトのアクセス統計",
  //   category: "advanced",
  // },
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURE_DEFS)[number]["key"];
export type PlanFeatureCategory = (typeof PLAN_FEATURE_DEFS)[number]["category"];
export type PlanFeatures = Partial<Record<PlanFeatureKey, boolean>>;

// カテゴリ定義（表示順・ラベル）
// 新カテゴリ追加時はここにも追記してください
export const PLAN_FEATURE_CATEGORIES = [
  { key: "content",   label: "コンテンツ・会員管理" },
  { key: "marketing", label: "マーケティング・顧客管理" },
  { key: "ai",        label: "AI・生産性" },
  // { key: "advanced", label: "上級・連携機能" },
] as const satisfies { key: PlanFeatureCategory; label: string }[];

/**
 * 機能が有効かどうかを返す。
 * features に明示的に false が設定されている場合のみ無効。
 * 未設定 / plan_id 未割当の場合はデフォルト有効（既存クライアントの後方互換）。
 */
export function hasFeature(features: PlanFeatures, key: PlanFeatureKey): boolean {
  if (features[key] === false) return false;
  return true;
}

/**
 * 有効な機能キーの配列を返す（プラン一覧バッジ表示用）。
 * features が空オブジェクトの場合は「全機能有効」を意味するが、
 * 表示上は設定された機能のみを示す（hasFeature のデフォルト有効とは別概念）。
 */
export function getEnabledFeatureKeys(features: PlanFeatures): PlanFeatureKey[] {
  return PLAN_FEATURE_DEFS
    .filter((f) => features[f.key] === true)
    .map((f) => f.key);
}

/**
 * 機能キーからラベルを取得する。
 */
export function getFeatureLabel(key: PlanFeatureKey): string {
  return PLAN_FEATURE_DEFS.find((f) => f.key === key)?.label ?? key;
}
