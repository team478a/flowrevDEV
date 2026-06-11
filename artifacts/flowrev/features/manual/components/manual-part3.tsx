import { ManualSection, SubSection, Step, Tip } from "./manual-section";

export function ManualPart3() {
  return (
    <>
      {/* 6. コース・会員サイト */}
      <ManualSection id="members" title="コース・会員サイト管理" icon="🎓">
        <SubSection title="コースを作成する">
          <Step n={1}>「コース管理」をクリックします。</Step>
          <Step n={2}>「新規コース」を押し、コース名・説明を入力します。</Step>
          <Step n={3}>保存するとコースが作成され、レッスンを追加できるようになります。</Step>
        </SubSection>
        <SubSection title="レッスンを追加する">
          <Step n={1}>コース一覧から対象コースをクリックします。</Step>
          <Step n={2}>「レッスンを追加」を押し、以下を入力します。<br />
            <span className="block mt-2 ml-2 space-y-1 text-muted-foreground text-xs">
              <span className="block">・<strong>タイトル</strong>（必須）</span>
              <span className="block">・<strong>コンテンツ種別</strong>：テキスト / 動画（URL）/ 動画（Cloudflare Stream）/ ファイル</span>
              <span className="block">・<strong>本文・動画 URL・ファイル</strong>（種別に応じて入力）</span>
              <span className="block">・<strong>並び順</strong>（ドラッグで変更可）</span>
            </span>
          </Step>
          <Step n={3}>「保存」を押します。</Step>
          <Tip>Cloudflare Stream を使うと動画の不正ダウンロードを防ぐ署名付き URL が自動で付与されます。</Tip>
        </SubSection>
        <SubSection title="顧客のコース進捗を確認する">
          <Step n={1}>「顧客管理」から顧客詳細を開きます。</Step>
          <Step n={2}>「コース進捗」セクションに各コースの完了レッスン数が表示されます。</Step>
        </SubSection>
        <SubSection title="顧客（受講者）から見えるマイページ">
          <p className="text-sm text-muted-foreground leading-relaxed">
            顧客は <code className="text-xs bg-muted px-1 rounded">/my</code> にアクセスすると以下が利用できます。
          </p>
          <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
            {[
              ["コース一覧", "受講中・未受講のコースが一覧表示されます。"],
              ["レッスン視聴", "テキスト・動画・ファイルを順に閲覧できます。"],
              ["進捗記録", "「✅ 完了にする」ボタンで進捗が記録されます。"],
              ["マイ設定", "/my/settings で表示名・パスワードを変更できます。"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border p-3">
                <div className="font-semibold text-foreground mb-1">{k}</div>
                <div>{v}</div>
              </div>
            ))}
          </div>
        </SubSection>
      </ManualSection>

      {/* 7. シナリオ */}
      <ManualSection id="scenarios" title="フォローシナリオ" icon="⚡">
        <SubSection title="シナリオとは">
          <p className="text-sm text-muted-foreground leading-relaxed">
            顧客が LP から登録した後に、設定した日数後に自動でメールを送る仕組みです。
            「登録直後」「3 日後」「7 日後」など複数ステップを組み合わせることで、フォローを自動化できます。
          </p>
        </SubSection>
        <SubSection title="シナリオを作成する">
          <Step n={1}>「シナリオ」をクリックし「新規作成」を押します。</Step>
          <Step n={2}>シナリオ名を入力します（例：初回購入フォロー）。</Step>
          <Step n={3}>「ステップを追加」を押し、各メールを設定します。<br />
            <span className="block mt-2 ml-2 space-y-1 text-muted-foreground text-xs">
              <span className="block">・<strong>送信タイミング</strong>：登録から何日後に送るか（0 = 即時）</span>
              <span className="block">・<strong>件名</strong>：メールの件名</span>
              <span className="block">・<strong>本文</strong>：メール本文（AI 生成ボタンあり）</span>
            </span>
          </Step>
          <Step n={4}>ステップを必要な数だけ追加し「保存」を押します。</Step>
          <Tip>「✨ AI 生成」ボタンでターゲットと目的を入力すると、件名と本文を自動生成します。</Tip>
        </SubSection>
        <SubSection title="LP とシナリオを紐づける">
          <Step n={1}>LP 編集画面を開きます。</Step>
          <Step n={2}>「連携シナリオ」のドロップダウンから適用するシナリオを選択します。</Step>
          <Step n={3}>保存すると、このLPから登録した顧客に自動でシナリオが適用されます。</Step>
          <Tip type="warn">シナリオを変更しても、すでにエンキュー済みのメールはキャンセルされません。新規登録分から適用されます。</Tip>
        </SubSection>
        <SubSection title="送信履歴を確認する">
          <Step n={1}>シナリオ一覧から「履歴」ボタンをクリックします。</Step>
          <Step n={2}>各メールの送信状況（pending / sent / failed）を確認できます。</Step>
        </SubSection>
      </ManualSection>
    </>
  );
}
