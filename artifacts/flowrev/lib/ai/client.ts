import Anthropic from "@anthropic-ai/sdk";
import { getActiveAiSetting } from "@/lib/repositories/ai-settings";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 4096;

/**
 * DB に保存された API キーを使って Anthropic でテキストを生成する。
 * server-side（API Route / Server Action）からのみ呼び出す。
 */
export async function generateText(prompt: string): Promise<string> {
  const setting = await getActiveAiSetting("anthropic");
  if (!setting) {
    throw new Error(
      "AI API キーが設定されていません。管理者へお問い合わせください。",
    );
  }

  const client = new Anthropic({ apiKey: setting.apiKey });
  const message = await client.messages.create({
    model: setting.model ?? DEFAULT_MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (!block || block.type !== "text") {
    throw new Error("AI からの応答が取得できませんでした。");
  }
  return block.text;
}

/** 商品説明文を生成するプロンプトを構築する。 */
export function buildProductPrompt(name: string, category: string): string {
  return `以下の商品・サービスの説明文を日本語で200字程度で作成してください。
ターゲット顧客が購買意欲を持てるよう、具体的なベネフィットを含めてください。
箇条書きは使わず、文章で記述してください。

商品名: ${name}
カテゴリ: ${category || "未設定"}

説明文のみを返してください（前置き・後書きは不要）。`;
}

const STYLE_GUIDE: Record<string, string> = {
  モダン: "クリーンでミニマル。大胆な見出し・広い余白・直線的なレイアウト。シャープなコーナー（border-radius: 6px）。",
  ナチュラル: "温かみのある有機的なデザイン。丸みのあるコーナー（border-radius: 16px）、親しみやすいトーン。",
  高級感: "洗練されたエレガントなデザイン。広い余白・上品な行間・控えめな色使い。ゴールド系アクセント。",
  ポップ: "カラフルで活気のあるデザイン。大きなCTAボタン・メリハリのある色使い・楽しい雰囲気。影(box-shadow)を積極活用。",
  ビジネス: "プロフェッショナルで信頼感のあるデザイン。整列されたグリッドレイアウト・数値や実績を強調。",
};

/** LP 本文（スタイル付き HTML）を生成するプロンプトを構築する。 */
export function buildLpPrompt(
  title: string,
  productName: string,
  referenceContent?: string,
  design?: {
    styleName?: string;
    primary?: string;
    bg?: string;
    accent?: string;
  },
): string {
  const primary = design?.primary ?? "#2563eb";
  const bg = design?.bg ?? "#eff6ff";
  const accent = design?.accent ?? "#1d4ed8";
  const styleName = design?.styleName ?? "モダン";
  const styleDesc = STYLE_GUIDE[styleName] ?? STYLE_GUIDE["モダン"];

  const refSection = referenceContent
    ? `\n## 参考サイトの文章（ライティングスタイルと構成のみ参考にすること）\n${referenceContent}\n\n文章をコピーせず、ライティングのトーン・見出し構成・訴求の流れを参考に、下記の商品に合ったオリジナルの LP を作成してください。\n`
    : "";

  return `以下の条件でランディングページの HTML（<style>タグ込み）を生成してください。

## 基本情報
- ページの目的: ${title}
- 商品名: ${productName || "未設定"}
- デザインスタイル: ${styleName} — ${styleDesc}
- メインカラー: ${primary}（ボタン・見出し強調・アクセント）
- 背景カラー: ${bg}（セクション背景）
- アクセントカラー: ${accent}（ホバー・境界線）
${refSection}
## HTML の構成（この順で作成）
1. **ヒーロー** — 大きなキャッチコピー・サブコピー・CTAボタン「今すぐ申し込む」
2. **課題提示** — "こんなお悩みありませんか？" + 3〜4項目の悩みリスト
3. **特徴・ベネフィット** — "選ばれる理由" + 3項目をカード形式で
4. **中間 CTA** — 申し込みボタン（理由を添えて）
5. **よくある質問** — 2〜3問（Q & A 形式）
6. **最終 CTA** — 締めのメッセージ＋ボタン

## CSS の要件（<style>タグに記述）
- body: max-width:600px; margin:0 auto; font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Yu Gothic',sans-serif; color:#1a1a1a; background:#fff;
- セクション: padding:48px 24px;
- ヒーローセクション: background:${bg}; text-align:center; padding:64px 24px;
- h1: font-size:2em; line-height:1.3; color:${accent}; margin-bottom:0.5em;
- h2: font-size:1.4em; color:${accent}; margin-bottom:1em;
- .cta-button: display:block; background:${primary}; color:#fff; text-align:center; padding:16px 32px; border-radius:8px; font-size:1.1em; font-weight:bold; text-decoration:none; max-width:320px; margin:24px auto 0;
- カードグリッド: display:flex; flex-direction:column; gap:16px;
- カード: border:1px solid ${accent}22; border-radius:8px; padding:20px; background:#fff;
- 日本語で記述すること

HTMLの<style>タグとコンテンツのみを返してください（<!DOCTYPE>・<html>・<body>タグは不要）。`;
}

/** フォローメッセージ（メール本文）を生成するプロンプトを構築する。 */
export function buildFollowPrompt(subject: string, scenarioName: string): string {
  return `以下のフォローメールの本文を日本語で作成してください。
親しみやすく、行動を促す文章にしてください。200〜300字程度。

メールの件名: ${subject || "フォローアップ"}
シナリオ名: ${scenarioName || "未設定"}

本文のみを返してください（前置き・後書きは不要）。`;
}
