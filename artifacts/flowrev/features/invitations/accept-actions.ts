"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getValidInvitationByToken,
  claimInvitation,
  revertInvitationToPending,
} from "@/lib/repositories/invitations";
import { createClientForOwner } from "@/lib/repositories/clients";

const schema = z
  .object({
    token: z.string().trim().min(1),
    password: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください。"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "パスワードが一致しません。",
    path: ["confirmPassword"],
  });

export interface AcceptInvitationState {
  error: string | null;
}

/**
 * 招待受諾サーバーアクション。
 * トークン検証 → Auth ユーザー作成 → clients 作成 → 招待を accepted に更新 →
 * サインインして client_owner ダッシュボードへリダイレクトする。
 * clients/invitations の書き込みは RLS 上本人不可のため admin で行う。
 */
export async function acceptInvitationAction(
  _prevState: AcceptInvitationState,
  formData: FormData,
): Promise<AcceptInvitationState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  const { token, password } = parsed.data;

  const invitation = await getValidInvitationByToken(token);
  if (!invitation) {
    return {
      error: "招待が無効か、有効期限が切れています。招待者にご確認ください。",
    };
  }

  const admin = createAdminClient();
  const displayName = invitation.representativeName ?? invitation.clientName;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "client_owner",
      white_label_id: invitation.whiteLabelId,
      display_name: displayName,
      client_name: invitation.clientName,
    },
  });

  if (createError || !created?.user) {
    const already = createError?.message
      ?.toLowerCase()
      .includes("already");
    return {
      error: already
        ? "このメールアドレスは既に登録されています。ログインしてください。"
        : `アカウント作成に失敗しました: ${createError?.message ?? "不明なエラー"}`,
    };
  }

  const userId = created.user.id;

  // 補償: 作成済み Auth ユーザーを削除する。失敗時は権限主体が残留するため監査ログを残す。
  const cleanupUser = async () => {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error(
        `[invite-accept] ユーザー補償削除に失敗（残留の可能性）: userId=${userId} token=${token} ${error.message}`,
      );
    }
  };

  // 招待を排他的に請求する。pending かつ未期限を 1 件だけ accepted にできた場合のみ続行。
  // 競合・二重受諾・期限切れ時は 0 件となり、作成したユーザーを削除して中断する。
  let claimed = false;
  try {
    claimed = await claimInvitation(token);
  } catch (e) {
    await cleanupUser();
    return {
      error: e instanceof Error ? e.message : "登録処理に失敗しました。",
    };
  }

  if (!claimed) {
    await cleanupUser();
    return {
      error: "この招待は既に使用されています。招待者にご確認ください。",
    };
  }

  try {
    await createClientForOwner({
      whiteLabelId: invitation.whiteLabelId,
      ownerUserId: userId,
      businessName: invitation.clientName,
      planId: invitation.planId ?? null,
    });
  } catch (e) {
    // 補償: clients 作成に失敗したらユーザー削除＋招待を pending へ戻す。
    await cleanupUser();
    const { error: revertError } = await revertInvitationToPending(token);
    if (revertError) {
      console.error(
        `[invite-accept] 招待の pending 復帰に失敗: token=${token} ${revertError}`,
      );
    }
    return {
      error: e instanceof Error ? e.message : "登録処理に失敗しました。",
    };
  }

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: invitation.email,
    password,
  });

  if (signInError) {
    redirect("/login");
  }

  redirect("/dashboard");
}
