# FlowRev

「一人でも回るAI運営システム」— 4階層（system_admin → white_label_owner → client_owner → customer）のマルチテナント SaaS。仕様書: `attached_assets/FLOWREV_DEV_SPEC_v2_3_fixed_1780812969178.md`。

## Run & Operate

- アプリは Replit のワークフロー `artifacts/flowrev: FlowRev Web` で起動（プレビューは `/`）
- `pnpm --filter @workspace/flowrev run serve` — 本番ビルド + 起動（ワークフローが実行）
- `pnpm --filter @workspace/flowrev run dev` — Next.js 開発サーバー（※下記 Gotchas 参照：プレビューには使わない）
- `pnpm --filter @workspace/flowrev run typecheck` — flowrev の型チェック
- `pnpm --filter @workspace/flowrev run build` — 本番ビルド
- デプロイ: Vercel（Root Directory = `artifacts/flowrev`）。`vercel.json` / `.nvmrc` 同梱

## Stack

- pnpm workspaces, Node.js 24（Vercel は Node 20）, TypeScript 5.9
- フロント/サーバー: Next.js 14.2（App Router）
- UI: Tailwind CSS v3 + shadcn/ui（`components.json` 設定済み、`@/*` エイリアス）
- DB/Auth/Storage: Supabase（※未接続、認証情報準備中）
- AI: Anthropic / OpenAI（キーは DB に暗号化保存し管理画面で設定）
- メール: Resend（同上、DB 保存）
- バリデーション: Zod

## Where things live（FlowRev）

- `artifacts/flowrev/app/` — App Router（`(auth)` / `(dashboard)` / `admin` / `wl` / `my` / `p/[slug]` / `api`）
- `artifacts/flowrev/features/` — 機能別モジュール（products / lp / customers / scenarios / members / dashboard / auth / invitations）
- `artifacts/flowrev/components/ui` — shadcn コンポーネント設置先
- `artifacts/flowrev/lib/` — `utils.ts`（cn）, `supabase/`, `repositories/`, `ai/`
- `artifacts/flowrev/.replit-artifact/artifact.toml` — Replit ルーティング設定（`/` → port 3000）
- `artifacts/flowrev/.env.example` — 必要な環境変数の一覧

## Architecture decisions

- Next.js は Replit のネイティブ artifact 種別に無いため、`artifacts/flowrev/` に手動構成 + 手書き `artifact.toml`（path `/`）+ ワークフローで運用。
- flowrev は独自 `package.json`（catalog ピン未使用、React 18 / Tailwind v3）— Next14 + shadcn の安定性を優先。
- AI/メールキーは env ではなく DB に暗号化保存（`ENCRYPTION_KEY` シークレットで暗号化）。HQ 共通キー + ホワイトラベル毎の上書きの「ハイブリッド」方式。
- ブランチ戦略: `feature/*` → `develop`（Vercel Preview / Supabase Dev）→ `main`（Vercel Production / Supabase Prod）。Replit からは `feature/*` のみ push。

## 実装済み機能一覧（MVP完了）

### Phase 1 — 認証・ロール・テナント・招待
- メール＋パスワードによるログイン／ログアウト（Supabase Auth）
- 4階層ロール（system_admin / white_label_owner / client_owner / customer）
- ロール別ログイン後リダイレクト（/admin / /wl / /dashboard / /my）
- RLS（Row Level Security）によるマルチテナントデータ分離
- white_label_owner によるクライアント招待メール送信（Resend）
- 招待URLからの client_owner 登録フロー（/register?token=...）
- Supabase Auth ミドルウェア（セッション管理・公開ルート制御）

### Phase 2 — 商品・LP管理
- 商品 CRUD（/products）— タイトル・説明・価格・サムネイル・ステータス
- LP 作成・編集・公開（/lp）— スラッグ自動生成・公開URL（/p/[slug]）
- 公開LP フォーム（顧客登録 POST /api/p/register）
- コンバージョンカウント自動インクリメント
- white_label_id の自動セット（テナント分離）
- Supabase Storage を使った商品画像アップロード

### Phase 3 — 会員サイト（/my）
- コース・レッスン CRUD（/members → コース管理、レッスン管理）
- 顧客向けマイページ（/my）— コース一覧表示
- レッスン視聴ページ（/my/courses/[id]）— テキスト・動画・ファイル対応
- レッスン進捗記録（✅ 完了にする → POST /api/my/progress）
- 進捗カウンター表示（N/M レッスン完了）
- lesson_progress テーブルへの UPSERT

### Phase 4 — 顧客管理・フォロー
- 顧客一覧・詳細・新規登録（/customers）
- CSV エクスポート（全件・未アクション絞り込み）— BOM付き UTF-8
- フォローシナリオ CRUD（/scenarios）
- シナリオステップ設定（delay_days・subject・body・channel）
- LP 登録時の purchase シナリオ自動エンキュー
- シナリオ実行バッチ API（POST /api/admin/scenarios/execute?force=true）
- 管理画面「▶ テスト実行（即時）」ボタン
- scenario_logs によるメール送信履歴管理（pending → sent / failed）

### Phase 5 — AI 機能
- Anthropic Claude API 連携（DB に暗号化保存、管理画面で設定）
- OpenAI API 連携（同上）
- 商品説明 AI 生成（POST /api/ai/generate-product）
- LP 文章 AI 生成（POST /api/ai/generate-lp）
- フォローメッセージ AI 生成（POST /api/ai/generate-follow）
- AI 生成ボタン（AiGenerateButton コンポーネント）各編集画面に配置

### 管理機能（system_admin）
- ホワイトラベル作成・管理（/admin/white-labels）
- プラン管理（/admin/plans）
- メール設定（Resend API キー・送信元、/admin/settings/email）
- AI設定（Anthropic / OpenAI キー管理、/admin/settings/ai・openai）
- API キーの AES-256-GCM 暗号化保存（ENCRYPTION_KEY）

### インフラ・デプロイ
- GitHub リポジトリ（team478a/flowrevDEV）
- Vercel 本番デプロイ（flowrev-dev-flowrev.vercel.app）
- Supabase（flowrev-dev）— Auth・DB・RLS・Storage

### MVP 後追加実装（Phase 6〜）

#### 顧客向け認証・マイページ強化
- パスワードリセットフロー（/reset-password → メール送信 → /update-password）
- /my/settings（表示名・パスワード変更）
- LP登録時に Supabase Auth 招待メールを自動送信（admin.auth.admin.inviteUserByEmail）
  - 新規顧客 → 招待メール送信 → user_profiles 作成 → customers.user_id リンク
  - 既存アカウントはスキップ（すでにログイン可能）
  - redirectTo = `/auth/callback?next=/my`
  - ⚠️ Supabase Dashboard の Additional redirect URLs への追加が必要

#### コード品質リファクタリング
- `features/admin/actions.ts` を3ファイルに分割（white-label / plan / email）
- `features/members/actions.ts` を2ファイルに分割（course / lesson）+ `types.ts`
- `app/(dashboard)/dashboard/page.tsx` から KpiCard・RecentCustomers を feature コンポーネントに抽出
- すべてバレルファイルで後方互換を維持

#### LPビルダー強化（2系統作成フロー）
- **かんたん作成**（`/lp/new?mode=easy`）— 目的・ターゲットを入力 → AI生成 → プレビュー確認 → 保存。HTMLの知識不要。
- **自由編集**（`/lp/new?mode=advanced`）— HTMLエディター左 ＋ リアルタイムプレビュー右（2カラム）。モバイルはタブ切替。
- 新規作成時にモード選択画面（`LpCreateModeSelector`）を表示
- 既存の LP 編集画面（`/lp/[id]`）にも自動的にリアルタイムプレビューが適用

## Product

詳細は仕様書参照。MVP（Phase 1〜5）＋ Phase 6 追加実装済み。次は本番 Supabase（flowrev-prod）切り替えまたは将来フェーズ。

## User preferences

- 返答は日本語。各タスク完了時は所定の【完了】フォーマットで報告。
- Phase1 優先・1タスクずつ。各タスク着手前に計画を提示し承認を得る。
- `feature/*` ブランチで作業（main へ直接 push しない）。
- Replit DB / Replit 固有機能は使わない（Supabase を使用）。
- MVP ではテストコードを書かない。1ファイル最大 300 行。

## Gotchas

- **`next dev` は Replit のポート検出に通らない**（起動はするが `DIDNT_OPEN_A_PORT` で失敗）。ワークフローは `serve`（`next build && next start`）で本番ビルドを配信する。コード変更はワークフロー再起動で反映（HMR なし）。詳細は `.agents/memory/nextjs-replit-port-detection.md`。
- パッケージファイアウォールが古いパッチ版を 403 でブロックすることがある（例: `next@14.2.18`）。許可される版を探して固定する。
- api-server artifact は `/_apiserver` へ退避済み（旧 `/api`）。これにより flowrev の Next.js `/api/*` がプロキシで `/`（flowrev）へフォールスルーする。api-server を再び `/api` に戻すと flowrev の API が全て 404 になるので注意。
- 公開（匿名）アクセスが必要な API ルートは flowrev の `lib/supabase/middleware.ts` の `PUBLIC_PREFIXES` に追加する（例: `/api/p` = 公開LPフォーム送信）。未追加だと匿名 POST が `/login` へ 307 リダイレクトされる。

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
