import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";

/**
 * APIキー等の機密値を保存するための対称暗号ユーティリティ（AES-256-GCM）。
 * 鍵は環境シークレット ENCRYPTION_KEY（32バイト = 64文字の16進数）から導出する。
 * 保存形式は "iv:authTag:ciphertext"（各16進数）。
 */

const IV_BYTES = 12;

function getKey(): Buffer {
  const raw = (process.env.ENCRYPTION_KEY ?? "").trim();
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY が未設定です。暗号化機能を使う前にシークレットを設定してください。",
    );
  }
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY は 32バイト（64文字の16進数）である必要があります。",
    );
  }
  return key;
}

/**
 * 平文を暗号化して "iv:authTag:ciphertext"（16進数）を返す。
 */
export function encrypt(plain: string): string {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    ciphertext.toString("hex"),
  ].join(":");
}

/**
 * encrypt() で生成した文字列を復号して平文を返す。
 * 形式不正・改ざん検知時は例外を投げる。
 */
export function decrypt(payload: string): string {
  const key = getKey();
  const parts = (payload ?? "").split(":");
  if (parts.length !== 3) {
    throw new Error("暗号文の形式が不正です。");
  }
  const [ivHex, tagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plain = Buffer.concat([decipher.update(data), decipher.final()]);
  return plain.toString("utf8");
}
