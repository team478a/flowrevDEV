import { ManualSection, SubSection, Step, Tip } from "./manual-section";

export function ManualPart4() {
  return (
    <>
      {/* 8. AI 機能 */}
      <ManualSection id="ai" title="AI 機能の使い方" icon="✨">
        <SubSection title="使える場所と内容">
          <div className="grid gap-2 sm:grid-cols-2 text-xs">
            {[
              ["商品説明の自動生成", "商品編集画面 → 「✨ AI 生成」ボタン。商品名から説明文を自動生成します。"],
              ["LP 文章の自動生成", "LP かんたん作成モードでターゲット・目的を入力すると全文生成します。"],
              ["フォローメールの自動生成", "シナリオのステップ編集 → 「✨ AI 生成」ボタン。件名・本文を自動生成します。"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="font-semibold text-foreground mb-1">{k}</div>
                <div className="text-muted-foreground leading-relaxed">{v}</div>
              </div>
            ))}
          </div>
        </SubSection>
        <SubSection title="AI 生成の手順（共通）">
          <Step n={1}>各画面の「✨ AI 生成」ボタンをクリックします。</Step>
          <Step n={2}>ポップアップに必要事項（ターゲット・目的など）を入力します。</Step>
          <Step n={3}>「生成する」を押して数秒待ちます。</Step>
          <Step n={4}>生成結果が入力欄に自動で挿入されます。必要に応じて手動で修正してください。</Step>
          <Tip>AI の出力はあくまで「たたき台」です。ブランドのトーン・ボイスに合わせて必ず確認してください。</Tip>
        </SubSection>
        <SubSection title="AI が使えない場合">
          <p className="text-sm text-muted-foreground leading-relaxed">
            以下の場合、AI 機能は利用できません。管理者（system_admin）にお問い合わせください。
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
            <li>Anthropic / OpenAI の API キーが設定されていない</li>
            <li>契約プランに AI 機能が含まれていない</li>
          </ul>
        </SubSection>
      </ManualSection>

      {/* 9. 購入履歴 */}
      <ManualSection id="purchases" title="購入履歴" icon="💳">
        <SubSection title="購入履歴の確認">
          <p className="text-sm text-muted-foreground leading-relaxed">
            顧客が LP フォームから購入・登録した履歴が一覧で確認できます。
          </p>
          <Step n={1}>サイドバーの「購入履歴」をクリックします。</Step>
          <Step n={2}>顧客名・商品名・購入日時・金額が一覧で表示されます。</Step>
          <Step n={3}>顧客名をクリックすると顧客詳細ページに移動します。</Step>
        </SubSection>
      </ManualSection>

      {/* 10. 設定 */}
      <ManualSection id="settings" title="設定" icon="⚙️">
        <SubSection title="プロフィール設定">
          <Step n={1}>サイドバー下部のアカウント名またはメールをクリックします。</Step>
          <Step n={2}>表示名を変更して「保存」を押します。</Step>
        </SubSection>
        <SubSection title="パスワードの変更">
          <Step n={1}>「設定」→「パスワード変更」セクションを開きます。</Step>
          <Step n={2}>新しいパスワードを入力して「変更する」を押します。</Step>
          <Tip type="warn">パスワードは 8 文字以上で設定してください。変更後は再ログインが必要になる場合があります。</Tip>
        </SubSection>
        <SubSection title="よくある質問">
          <div className="space-y-3">
            {[
              ["LP の公開 URL はどこで確認できますか？", "LP 一覧または LP 編集画面の右上に公開 URL が表示されます。コピーボタンで簡単にコピーできます。"],
              ["顧客にパスワードリセットを案内するには？", "顧客は /login ページの「パスワードを忘れた方はこちら」から自分でリセットできます。メールが届かない場合は迷惑メールフォルダを確認するよう案内してください。"],
              ["メールが届かない顧客がいます", "シナリオの送信履歴で「failed」になっていないか確認してください。failed の場合は管理者のメール設定（Resend API キー）をご確認ください。"],
              ["動画が再生できない（顧客からの報告）", "レッスンの動画種別が「Cloudflare Stream」の場合、署名付き URL の有効期限が切れている可能性があります。ページを再読み込みするよう案内してください。"],
            ].map(([q, a]) => (
              <details key={q as string} className="rounded-lg border border-border">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 list-none flex items-center gap-2">
                  <span className="text-primary">Q.</span> {q}
                </summary>
                <div className="px-4 pb-3 pt-1 text-sm text-muted-foreground border-t border-border leading-relaxed">
                  <span className="font-semibold text-foreground">A.</span> {a}
                </div>
              </details>
            ))}
          </div>
        </SubSection>
      </ManualSection>
    </>
  );
}
