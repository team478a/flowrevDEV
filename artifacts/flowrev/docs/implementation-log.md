# FlowRev 実装記録

最終更新: 2026-06-11

---

## フェーズ 1〜5（MVP）

### Phase 1 — 認証・ロール・テナント・招待
- メール＋パスワードによるログイン／ログアウト（Supabase Auth）
- 4階層ロール（system_admin / white_label_owner / client_owner / customer）
- ロール別ログイン後リダイレクト（`/admin` / `/wl` / `/dashboard` / `/my`）
- RLS（Row Level Security）によるマルチテナントデータ分離
- white_label_owner によるクライアント招待メール送信（Resend）
- 招待URLからの client_owner 登録フロー（`/register?token=...`）
- Supabase Auth ミドルウェア（セッション管理・公開ルート制御）

### Phase 2 — 商品・LP管理
- 商品 CRUD（`/products`）— タイトル・説明・価格・サムネイル・ステータス
- LP 作成・編集・公開（`/lp`）— スラッグ自動生成・公開URL（`/p/[slug]`）
- 公開LP フォーム（顧客登録 `POST /api/p/register`）
- コンバージョンカウント自動インクリメント
- Supabase Storage を使った商品画像アップロード

### Phase 3 — 会員サイト（`/my`）
- コース・レッスン CRUD（`/members`）
- 顧客向けマイページ（`/my`）— コース一覧表示
- レッスン視聴ページ（`/my/courses/[id]`）— テキスト・動画・ファイル対応
- レッスン進捗記録（`lesson_progress` テーブルへの UPSERT）
- 進捗カウンター表示（N/M レッスン完了）

### Phase 4 — 顧客管理・フォロー
- 顧客一覧・詳細・新規登録（`/customers`）
- CSV エクスポート（全件・未アクション絞り込み）— BOM付き UTF-8
- フォローシナリオ CRUD（`/scenarios`）
- シナリオステップ設定（delay_days・subject・body・channel）
- LP 登録時の purchase シナリオ自動エンキュー
- シナリオ実行バッチ API（`POST /api/admin/scenarios/execute`）
- `scenario_logs` によるメール送信履歴管理（pending → sent / failed）

### Phase 5 — AI 機能
- Anthropic Claude / OpenAI API 連携（DB に暗号化保存）
- 商品説明 AI 生成（`POST /api/ai/generate-product`）
- LP 文章 AI 生成（`POST /api/ai/generate-lp`）
- フォローメッセージ AI 生成（`POST /api/ai/generate-follow`）
- `AiGenerateButton` コンポーネント（各編集画面に配置）

### 管理機能（system_admin）
- ホワイトラベル作成・管理（`/admin/white-labels`）
- プラン管理（`/admin/plans`）
- メール設定（Resend API キー・送信元）
- AI設定（Anthropic / OpenAI キー管理）
- API キーの AES-256-GCM 暗号化保存（`ENCRYPTION_KEY` 環境変数）

---

## フェーズ 6 — MVP 後追加実装

### 顧客向け認証・マイページ強化
- パスワードリセットフロー（`/reset-password` → メール送信 → `/update-password`）
- `/my/settings`（表示名・パスワード変更）
- LP 登録時に Supabase Auth 招待メールを自動送信（`admin.auth.inviteUserByEmail`）

### コード品質リファクタリング
- `features/admin/actions.ts` を3ファイルに分割（white-label / plan / email）
- `features/members/actions.ts` を2ファイルに分割（course / lesson）+ `types.ts`
- `app/(dashboard)/dashboard/page.tsx` から KpiCard・RecentCustomers をfeatureコンポーネントに抽出

### LP ビルダー強化（2系統作成フロー）
- **かんたん作成**（`/lp/new?mode=easy`）— 目的・ターゲット → AI生成 → プレビュー → 保存
- **自由編集**（`/lp/new?mode=advanced`）— HTML エディター + リアルタイムプレビュー（2カラム）
- モード選択画面（`LpCreateModeSelector`）

---

## フェーズ 7 — Cloudflare Stream 動画ホスティング

### 基盤実装
- `cloudflare_settings` テーブル（account_id / api_token_enc / webhook_secret_enc）
- `lessons.video_type` / `lessons.cloudflare_video_id` / `lessons.cloudflare_video_status` カラム追加
- 管理画面 Cloudflare 設定ページ（`/admin/settings/cloudflare`）
- TUS アップロード API（`POST /api/admin/video/upload-url`）— role ガード付き
- `VideoUploader` コンポーネント（tus-js-client 使用）
- Cloudflare Stream iframe 再生（顧客向け `/my/courses/[id]`）

### 動画保護・アクセス制限
- 署名付き JWT URL（購入済み顧客のみ再生可能、`requiresignedurls` 有効化）
- Webhook でトランスコード完了を自動検知（`/api/webhooks/cloudflare-stream`）
- 既存動画への署名付きURL必須を一括適用（`/api/admin/video/protect-all`）
- 購入済みコースのみアクセス制限（`hasPurchasedProduct` チェック・ロック UI）
- Webhook シークレット管理画面設定（`/admin/settings/cloudflare` に統合）

### 一括保護ログ・履歴
- `cloudflare_protect_logs` テーブル（executed_at / executed_by / total / updated / failed / error_details）
- 実行履歴テーブル表示・ページネーション（20件単位）
- 実行者名表示（`user_profiles.display_name` 結合）
- 失敗した動画IDの詳細表示（`error_details` jsonb）
- 一括保護の失敗分だけを再試行するボタン
- 一括保護完了をトースト通知（sonner）

### 未保護動画チェック・アラート
- `video_check_logs` テーブル（checked_at / unprotected / total / notified）
- 毎日 09:00 JST に自動チェック（Vercel Cron）+ system_admin へのアラートメール
- `cloudflare_webhook_logs` テーブル（Webhook 受信ログ）
- `cloudflare_settings.alert_emails` — 管理画面から通知先を変更可能
- `cloudflare_settings.last_checked_at` / `last_alerted_at` / `last_unprotected_count`
- アラートメールに未保護動画の詳細リスト（最大10件＋タイトル、HTML テーブル）
- アラートメールに管理画面への直接リンク（CTA ボタン）
- 「今すぐチェック」手動実行ボタン（`/admin/settings/video`）
- チェック後に未保護ありの場合、amber色で「一括保護」ボタンを誘導
- 一括保護完了後に `router.refresh()` でサーバーデータを自動更新

### グラフ・可視化
- 未保護件数推移グラフ（recharts LineChart、`/admin/settings/video`）
- 未保護ポイントを赤/オレンジのドットで重大度別に強調
- 表示期間フィルター（過去7日/30日/全期間/カスタム）
- カスタム期間はカレンダーポップオーバー（react-day-picker v8 + Radix Popover）
- クイック期間プリセット（今月・先月・過去3ヶ月・今四半期・前四半期）
- 顧客登録数推移グラフ（recharts BarChart）をclient/admin両ダッシュボードに追加

### 管理画面整理
- 設定画面を `/admin/settings/video`（動画）と `/admin/settings/cloudflare`（CF設定）に分離
- ダッシュボードに動画保護ステータスカード・手動リフレッシュボタン
- ダッシュボードに実件数カード（WL数・プラン数・顧客数・LP数・商品数）

---

## フェーズ 8 — AI LP 生成強化

### 参考サイト URL → LP 生成
- LP かんたん作成フォームに「参考サイト URL（任意）」フィールドを追加
- バックエンドが URL を fetch → HTML タグ除去 → 最大3,000文字抽出（8秒タイムアウト）
- Claude のプロンプトに「ライティングスタイル・構成を参考にオリジナルを作成」と注入
- フェッチ失敗時はフォールバック生成（amber 警告バナーを表示）
- `MAX_TOKENS` を 1024 → 2048 に引き上げ（LP 生成品質向上）

---

## インフラ・デプロイ

| 項目 | 内容 |
|------|------|
| リポジトリ | `team478a/flowrevDEV`（GitHub） |
| Vercel | `flowrev-dev-flowrev.vercel.app`（Root Directory = `artifacts/flowrev`） |
| Supabase | `flowrev-dev`（Auth / DB / RLS / Storage） |
| Node.js | 24（Replit）/ 20（Vercel） |
| ブランチ戦略 | `feature/*` → `develop` → `main` |

---

## 主要ファイルマップ

```
artifacts/flowrev/
├── app/
│   ├── (auth)/              # ログイン・登録・パスワードリセット
│   ├── (dashboard)/         # client_owner ダッシュボード・商品・LP・顧客・シナリオ・会員
│   ├── admin/               # system_admin 管理画面
│   │   ├── dashboard/
│   │   ├── white-labels/
│   │   ├── plans/
│   │   └── settings/
│   │       ├── ai/
│   │       ├── cloudflare/  # CF アカウント設定・Webhook ログ
│   │       ├── email/
│   │       ├── openai/
│   │       └── video/       # 一括保護・チェックログ・グラフ
│   ├── wl/                  # white_label_owner
│   ├── my/                  # customer マイページ
│   ├── p/[slug]/            # 公開 LP
│   └── api/
│       ├── ai/              # generate-product / generate-lp / generate-follow
│       ├── admin/
│       │   ├── cron/        # check-unprotected-videos
│       │   ├── scenarios/   # execute
│       │   └── video/       # protect-all / unprotected-count / upload-url
│       ├── my/              # progress
│       ├── p/               # register（公開LP登録）
│       └── webhooks/        # cloudflare-stream / stripe
├── features/
│   ├── admin/
│   │   ├── actions/         # white-label / plan / email
│   │   └── components/      # 各種管理UIコンポーネント
│   ├── auth/
│   ├── customers/
│   ├── dashboard/           # KpiCard / RecentCustomers / CustomerTrendChart
│   ├── invitations/
│   ├── lp/
│   │   ├── actions.ts
│   │   └── components/      # LpEasyWizard / LpHtmlEditor / LpCreateModeSelector
│   ├── members/
│   │   ├── actions/         # course / lesson
│   │   └── components/
│   ├── products/
│   └── scenarios/
├── lib/
│   ├── ai/                  # client.ts（generateText / buildLpPrompt など）
│   ├── cloudflare/          # stream.ts（upload / protect / count）
│   ├── email/               # resend / send-unprotected-alert
│   ├── features/            # plan-features.ts / client-features.ts
│   ├── repositories/        # 各テーブルのデータアクセス層
│   └── supabase/            # client / server / middleware
├── components/ui/           # shadcn コンポーネント
├── docs/                    # このファイルを含むドキュメント
└── supabase/
    └── migrations/          # SQLマイグレーションファイル
```

---

## 未適用マイグレーション（要実行）

詳細な手順と SQL は `docs/supabase-setup.md` を参照してください。

| ファイル | 目的 | 優先度 |
|---------|------|--------|
| `0009_public_lp_policy.sql` | 公開LP ビュー（未適用だと `/p/[slug]` が404） | **高** |
| `0010_stripe_payments.sql` | Stripe 決済サポート | 中 |
| `add_cloudflare_stream.sql` | Cloudflare Stream 基盤 | **高**（CF機能使用前） |
| `add_cloudflare_protect_logs.sql` | 一括保護ログ | 高 |
| `add_error_details_to_protect_logs.sql` | 保護ログ・エラー詳細 | 高（上記の後） |
| `add_cloudflare_webhook_logs.sql` | Webhook 受信ログ | 中 |
| `add_alert_emails_to_cloudflare_settings.sql` | アラート通知先設定 | 中 |
| `add_cron_timestamps_to_cloudflare_settings.sql` | Cron実行タイムスタンプ | 低 |
| `add_video_check_logs.sql` | チェック履歴グラフ | 中 |
