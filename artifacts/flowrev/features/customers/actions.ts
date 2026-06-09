"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/repositories/customers";
import { customerSchema, parseTags } from "@/features/customers/schema";

export interface CustomerActionState {
  error: string | null;
  success?: boolean;
}

/** 顧客作成。client_owner のみ実行可能。 */
export async function createCustomerAction(
  _prev: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };
  if (!session.clientId || !session.whiteLabelId)
    return { error: "クライアント情報が取得できませんでした。" };

  const parsed = customerSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    phone: formData.get("phone") || undefined,
    source: formData.get("source"),
    status: formData.get("status"),
    tagsRaw: formData.get("tagsRaw") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    const customer = await createCustomer({
      whiteLabelId: session.whiteLabelId,
      clientId: session.clientId,
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      source: parsed.data.source,
      status: parsed.data.status,
      tags: parseTags(parsed.data.tagsRaw),
      notes: parsed.data.notes,
    });
    revalidatePath("/customers");
    redirect(`/customers/${customer.id}`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    const msg = e instanceof Error ? e.message : "作成に失敗しました。";
    const isDuplicate = msg.includes("unique") || msg.includes("duplicate");
    return {
      error: isDuplicate
        ? "このメールアドレスはすでに登録されています。"
        : msg,
    };
  }
}

/** 顧客更新。client_owner のみ実行可能。 */
export async function updateCustomerAction(
  id: string,
  _prev: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  const parsed = customerSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    phone: formData.get("phone") || undefined,
    source: formData.get("source"),
    status: formData.get("status"),
    tagsRaw: formData.get("tagsRaw") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    await updateCustomer(id, {
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      phone: parsed.data.phone ?? null,
      source: parsed.data.source,
      status: parsed.data.status,
      tags: parseTags(parsed.data.tagsRaw),
      notes: parsed.data.notes ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "更新に失敗しました。";
    const isDuplicate = msg.includes("unique") || msg.includes("duplicate");
    return {
      error: isDuplicate
        ? "このメールアドレスはすでに登録されています。"
        : msg,
    };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return { error: null, success: true };
}

/** 顧客削除。client_owner のみ実行可能。 */
export async function deleteCustomerAction(
  id: string,
): Promise<CustomerActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  try {
    await deleteCustomer(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath("/customers");
  redirect("/customers");
}
