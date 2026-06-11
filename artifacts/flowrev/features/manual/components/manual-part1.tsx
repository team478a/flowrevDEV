import { ManualSection, SubSection, Step, Tip } from "./manual-section";

export function ManualPart1() {
  return (
    <>
      {/* 1. はじめに */}
      <ManualSection id="intro" title="FlowRev とは" icon="🚀">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-sm text-muted-foreground leading-relaxed">
          <p className="mb-2">
            <strong className="text-foreground">FlowRev</strong> は、デジタル商品の販売・会員サイト運営・顧客フォローを
            ひとつのプラットフォームで完結させる SaaS ツールです。
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>LP（ランディングページ）の作成と公開</li>
            <li>顧客の登録・管理・CSV エクスポート</li>
            <li>コース・レッスン形式の会員サイト運営</li>
            <li>メール自動配信シナリオ</li>
            <li>AI による文章自動生成</li>
          </ul>
        </div>
        <Tip>まずは「商品登録 → LP 作成 → 公開」の流れを体験してみましょう。</Tip>
      </ManualSection>

      {/* 2. ダッシュボード */}
      <ManualSection id="dashboard" title="ダッシュボード" icon="⊞">
        <SubSection title="画面の見方">
          <p className="text-sm text-muted-foreground leading-relaxed">
            ログイン後に最初に表示される画面です。事業の現状をひと目で把握できます。
          </p>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            {[
              ["顧客数", "登録済み顧客の総数。今週の新規数も表示されます。"],
              ["LP 数", "作成済みのランディングページ数。"],
              ["商品数", "登録済み商品の総数。"],
              ["未アクション", "7 日以上反応のない顧客数。フォローのサインです。"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border p-3">
                <div className="font-semibold text-foreground mb-1">{k}</div>
                <div className="text-muted-foreground text-xs">{v}</div>
              </div>
            ))}
          </div>
        </SubSection>
        <SubSection title="顧客登録数の推移グラフ">
          <Step n={1}>グラフ右上のドロップダウンで期間を選択します（過去 7 日 / 30 日 / 全期間 / カスタム）。</Step>
          <Step n={2}>カスタムを選ぶと開始日・終了日を指定できます。</Step>
          <Tip>「未アクション」が表示されたら黄色バナーをクリック → 顧客一覧の未アクション絞り込みに直行できます。</Tip>
        </SubSection>
      </ManualSection>

      {/* 3. 商品管理 */}
      <ManualSection id="products" title="商品管理" icon="📦">
        <SubSection title="商品を新規登録する">
          <Step n={1}>サイドバーの「商品管理」をクリックします。</Step>
          <Step n={2}>右上「新規作成」ボタンを押します。</Step>
          <Step n={3}>以下の項目を入力します。<br />
            <span className="block mt-2 ml-2 space-y-1 text-muted-foreground">
              <span className="block">・<strong>商品名</strong>（必須）</span>
              <span className="block">・<strong>説明文</strong>（AI 生成ボタンで自動作成も可）</span>
              <span className="block">・<strong>価格</strong>（円単位で入力）</span>
              <span className="block">・<strong>サムネイル画像</strong>（JPEG / PNG をアップロード）</span>
              <span className="block">・<strong>ステータス</strong>（下書き / 公開）</span>
            </span>
          </Step>
          <Step n={4}>「保存」を押して完了です。</Step>
          <Tip>説明文の「✨ AI 生成」ボタンを押すと Claude が商品説明を自動で書いてくれます。</Tip>
        </SubSection>
        <SubSection title="商品を編集・削除する">
          <Step n={1}>商品一覧で対象の商品カードをクリックします。</Step>
          <Step n={2}>内容を変更して「保存」を押します。</Step>
          <Tip type="warn">ステータスを「下書き」にしても、すでに購入済みの顧客には影響しません。</Tip>
        </SubSection>
      </ManualSection>
    </>
  );
}
