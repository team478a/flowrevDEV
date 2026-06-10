import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface SessionProfile {
  userId: string;
  email: string | null;
  role: string | null;
  displayName: string | null;
  whiteLabelId: string | null;
  clientId: string | null;
}

/**
 * サーバーコンポーネント／サーバーアクションから現在のログインユーザーと
 * そのプロフィール（ロール等）を取得する。未ログインなら null。
 *
 * React cache() でラップすることで、同一リクエスト内（レイアウト＋ページ）で
 * 重複する DB 呼び出しを排除する（リクエスト単位のメモ化）。
 */
export const getSessionProfile = cache(
  async (): Promise<SessionProfile | null> => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, display_name, white_label_id, client_id")
      .eq("id", user.id)
      .single();

    return {
      userId: user.id,
      email: user.email ?? null,
      role: profile?.role ?? null,
      displayName: profile?.display_name ?? null,
      whiteLabelId: profile?.white_label_id ?? null,
      clientId: profile?.client_id ?? null,
    };
  },
);
