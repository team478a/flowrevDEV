import Anthropic from "@anthropic-ai/sdk";
import { getActiveAiSetting } from "@/lib/repositories/ai-settings";

const DEFAULT_MODEL = "claude-3-5-haiku-20241022";
const MAX_TOKENS = 1024;

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

/** LP 本文（HTML）を生成するプロンプトを構築する。 */
export function buildLpPrompt(title: string, productName: string): string {
  return `以下のランディングページ用のHTML本文を生成してください。
シンプルなHTMLタグ（h1, h2, p, ul, li, strong）のみを使ってください。
日本語で記述し、見出し・本文・特典・CTA の構成にしてください。

ページタイトル: ${title}
紐付け商品: ${productName || "未設定"}

HTMLのみを返してください（<!DOCTYPE>やbodyタグは不要）。`;
}

/** フォローメッセージ（メール本文）を生成するプロンプトを構築する。 */
export function buildFollowPrompt(subject: string, scenarioName: string): string {
  return `以下のフォローメールの本文を日本語で作成してください。
親しみやすく、行動を促す文章にしてください。200〜300字程度。

メールの件名: ${subject || "フォローアップ"}
シナリオ名: ${scenarioName || "未設定"}

本文のみを返してください（前置き・後書きは不要）。`;
}
