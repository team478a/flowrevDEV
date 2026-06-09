import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

const INVITE_EXPIRY_DAYS = 7;

export interface CreateInvitationInput {
  whiteLabelId: string;
  invitedBy: string;
  email: string;
  clientName: string;
  representativeName: string;
  planId?: string;
}

export interface InvitationRow {
  id: string;
  email: string;
  clientName: string;
  representativeName: string | null;
  status: string;
  expiresAt: string | null;
  createdAt: string | null;
}

/**
 * 暗号学的に安全な招待トークンを生成する（64文字の16進数・§14-1）。
 */
function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * クライアント招待を作成する（RLS 適用のセッションクライアント）。
 * white_label_owner のテナント配下にのみ作成可能（RLS WITH CHECK で担保）。
 * 7日間有効なトークンを発行し、token を返す。
 */
export async function createInvitation(
  input: CreateInvitationInput,
): Promise<{ id: string; token: string }> {
  const supabase = createClient();
  const token = generateInviteToken();
  const expiresAt = new Date(
    Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      white_label_id: input.whiteLabelId,
      invited_by: input.invitedBy,
      email: input.email,
      client_name: input.clientName,
      representative_name: input.representativeName,
      plan_id: input.planId ?? null,
      token,
      status: "pending",
      expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (error || !data) {
    throw new Error(
      `招待の作成に失敗しました: ${error?.message ?? "不明なエラー"}`,
    );
  }

  return { id: data.id as string, token: data.token as string };
}

/**
 * テナント配下の招待一覧を取得する（新しい順）。RLS で自テナントのみ。
 */
export async function listInvitations(): Promise<InvitationRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select(
      "id, email, client_name, representative_name, status, expires_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`招待一覧の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map((r) => ({
    id: r.id as string,
    email: r.email as string,
    clientName: r.client_name as string,
    representativeName: (r.representative_name as string) ?? null,
    status: r.status as string,
    expiresAt: (r.expires_at as string) ?? null,
    createdAt: (r.created_at as string) ?? null,
  }));
}
