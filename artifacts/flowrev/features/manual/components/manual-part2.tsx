import { ManualSection, SubSection, Step, Tip } from "./manual-section";

export function ManualPart2() {
  return (
    <>
      {/* 4. LP 管理 */}
      <ManualSection id="lp" title="LP 管理（ランディングページ）" icon="📄">
        <SubSection title="かんたん作成モード（おすすめ）">
          <p className="text-sm text-muted-foreground">
            AI が自動でLP文章を生成します。HTML の知識は不要です。
          </p>
          <Step n={1}>「LP 管理」→「新規作成」をクリックします。</Step>
          <Step n={2}>「かんたん作成」を選択します。</Step>
          <Step n={3}>
            以下を入力します。<br />
            <span className="block mt-2 ml-2 space-y-1 text-muted-foreground">
              <span className="block">・<strong>LP のタイトル</strong></span>
              <span className="block">・<strong>ターゲット</strong>（例：副業初心者、30代主婦）</span>
              <span className="block">・<strong>目的・訴求内容</strong>（例：プログラミング入門講座の案内）</span>
              <span className="block">・<strong>参考サイト URL</strong>（任意：競合や理想のデザインを貼ると反映されます）</span>
            </span>
          </Step>
          <Step n={4}>「AI で生成する」をクリック。数秒でLP文章が生成されます。</Step>
          <Step n={5}>プレビューを確認し「この内容で保存する」をクリックします。</Step>
          <Tip>気に入らない場合は「もう一度生成する」で再生成できます。</Tip>
        </SubSection>
        <SubSection title="自由編集モード">
          <p className="text-sm text-muted-foreground">
            HTML を直接書いてカスタマイズしたい方向けです。
          </p>
          <Step n={1}>「新規作成」→「自由編集」を選択します。</Step>
          <Step n={2}>左側のエディタに HTML を入力すると、右側にリアルタイムでプレビューが表示されます。</Step>
          <Step n={3}>スマートフォン表示を確認したい場合は「モバイル」タブに切り替えます。</Step>
          <Step n={4}>完成したら「保存」を押します。</Step>
        </SubSection>
        <SubSection title="LP を公開する">
          <Step n={1}>LP 一覧から対象の LP をクリックします。</Step>
          <Step n={2}>ステータスを「公開」に変更して保存します。</Step>
          <Step n={3}>公開 URL（<code className="text-xs bg-muted px-1 rounded">/p/スラッグ名</code>）がコピーできます。この URL を SNS や広告に掲載してください。</Step>
          <Tip>LP フォームから登録した顧客は自動的に顧客管理に追加され、設定済みのシナリオが自動起動します。</Tip>
        </SubSection>
        <SubSection title="LP を編集する（既存）">
          <Step n={1}>LP 一覧から対象をクリックします。</Step>
          <Step n={2}>編集画面は常に「左エディタ ＋ 右プレビュー」の 2 カラム表示です。</Step>
          <Step n={3}>変更後「保存」を押すと即時反映されます。</Step>
        </SubSection>
      </ManualSection>

      {/* 5. 顧客管理 */}
      <ManualSection id="customers" title="顧客管理" icon="👥">
        <SubSection title="顧客一覧の見方">
          <p className="text-sm text-muted-foreground leading-relaxed">
            登録されたすべての顧客が一覧表示されます。検索・絞り込みが可能です。
          </p>
          <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
            {[
              ["全顧客", "すべての顧客を表示します。"],
              ["未アクション", "7日以上ログイン・メール開封がない顧客に絞り込みます。"],
              ["CSV エクスポート", "現在の絞り込み結果を Excel で使える CSV ファイルとして保存します。"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border p-3">
                <div className="font-semibold text-foreground mb-1">{k}</div>
                <div>{v}</div>
              </div>
            ))}
          </div>
        </SubSection>
        <SubSection title="顧客を手動登録する">
          <Step n={1}>「顧客管理」→「新規登録」をクリックします。</Step>
          <Step n={2}>メールアドレス・表示名を入力して「登録」を押します。</Step>
          <Step n={3}>顧客にはログイン招待メールが送信されます。</Step>
          <Tip>LP フォームからの登録は自動的に行われるため、手動登録は個別対応時に使います。</Tip>
        </SubSection>
        <SubSection title="顧客詳細を確認する">
          <Step n={1}>顧客一覧から名前・メールをクリックします。</Step>
          <Step n={2}>登録日・コース進捗・シナリオ送信履歴・購入履歴が確認できます。</Step>
        </SubSection>
        <SubSection title="CSV エクスポート">
          <Step n={1}>一覧右上の「CSV エクスポート」をクリックします。</Step>
          <Step n={2}>現在表示中の絞り込み結果がダウンロードされます。</Step>
          <Tip>文字化けを防ぐため BOM 付き UTF-8 形式で出力されます。Excel でそのまま開けます。</Tip>
        </SubSection>
      </ManualSection>
    </>
  );
}
