import { createAdminClient } from "@/lib/supabase/admin";

export interface CreateClientInput {
  whiteLabelId: string;
  ownerUserId: string;
  businessName: string;
}

/**
 * クライアント（事業者）を作成し、オーナーの user_profiles.client_id を紐づける。
 * 招待受諾フローから呼ぶため admin クライアント（RLSバイパス）を使用する。
 * clients の INSERT は RLS 上 white_label_owner/system_admin のみ許可のため。
 */
export async function createClientForOwner(
  input: CreateClientInput,
): Promise<{ id: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      white_label_id: input.whiteLabelId,
      owner_user_id: input.ownerUserId,
      business_name: input.businessName,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `クライアントの作成に失敗しました: ${error?.message ?? "不明なエラー"}`,
    );
  }

  const clientId = data.id as string;

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ client_id: clientId })
    .eq("id", input.ownerUserId);

  if (profileError) {
    // 補償: プロフィール紐づけに失敗したら作成した clients を削除して整合を保つ。
    const { error: cleanupError } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);
    if (cleanupError) {
      console.error(
        `[clients] 補償削除に失敗（orphan client の可能性）: clientId=${clientId} ${cleanupError.message}`,
      );
    }
    throw new Error(
      `プロフィールの更新に失敗しました: ${profileError.message}`,
    );
  }

  return { id: clientId };
}
