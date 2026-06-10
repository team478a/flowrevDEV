"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleHomePath } from "./role";
import { getSessionProfile } from "./session";

export interface LoginState {
  error: string | null;
}

export interface ResetState {
  error: string | null;
  success: string | null;
}

/**
 * メール／パスワードでログインするサーバーアクション。
 * 成功時はロールに応じたホーム画面へリダイレクトする。
 * useFormState から (prevState, formData) の形で呼び出される。
 */
export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  // redirect() は例外を投げて制御を移すため try/catch の外で呼ぶ。
  redirect(roleHomePath(role));
}

/**
 * ログアウトしてログイン画面へ戻すサーバーアクション。
 */
export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * パスワードリセットメールを送信するサーバーアクション。
 */
export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "メールアドレスを入力してください。", success: null };
  }

  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto =
    process.env.NODE_ENV === "production"
      ? "https"
      : (headersList.get("x-forwarded-proto") ?? "http");
  const origin = `${proto}://${host}`;

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  if (error && error.status !== 429) {
    return { error: "メールの送信に失敗しました。", success: null };
  }

  return {
    error: null,
    success: "パスワードリセットのメールを送信しました。",
  };
}

/**
 * 新しいパスワードを設定するサーバーアクション（リセットメール経由）。
 */
export async function updatePassword(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return {
      error: "パスワードは8文字以上で入力してください。",
      success: null,
    };
  }
  if (password !== confirm) {
    return { error: "パスワードが一致しません。", success: null };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      error: `パスワード変更に失敗しました: ${error.message}`,
      success: null,
    };
  }

  const session = await getSessionProfile();
  redirect(session ? roleHomePath(session.role) : "/login");
}
