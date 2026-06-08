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

## Product

詳細は仕様書参照。Phase1 を最優先で、1タスクずつ実装する。

## User preferences

- 返答は日本語。各タスク完了時は所定の【完了】フォーマットで報告。
- Phase1 優先・1タスクずつ。各タスク着手前に計画を提示し承認を得る。
- `feature/*` ブランチで作業（main へ直接 push しない）。
- Replit DB / Replit 固有機能は使わない（Supabase を使用）。
- MVP ではテストコードを書かない。1ファイル最大 300 行。

## Gotchas

- **`next dev` は Replit のポート検出に通らない**（起動はするが `DIDNT_OPEN_A_PORT` で失敗）。ワークフローは `serve`（`next build && next start`）で本番ビルドを配信する。コード変更はワークフロー再起動で反映（HMR なし）。詳細は `.agents/memory/nextjs-replit-port-detection.md`。
- パッケージファイアウォールが古いパッチ版を 403 でブロックすることがある（例: `next@14.2.18`）。許可される版を探して固定する。
- Next.js の `/api/*` は将来 api-server（`/api`）と衝突する。`/api` ルートが必要になった段階で api-server artifact を整理する。

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
