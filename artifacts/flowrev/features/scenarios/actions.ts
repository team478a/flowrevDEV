"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/features/auth/session";
import {
  createScenario,
  updateScenario,
  deleteScenario,
  addStep,
  updateStep,
  deleteStep,
} from "@/lib/repositories/scenarios";
import { scenarioSchema, stepSchema } from "@/features/scenarios/schema";

export interface ScenarioActionState {
  error: string | null;
  success?: boolean;
}

/** シナリオ作成 */
export async function createScenarioAction(
  _prev: ScenarioActionState,
  formData: FormData,
): Promise<ScenarioActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };
  if (!session.clientId || !session.whiteLabelId)
    return { error: "クライアント情報が取得できませんでした。" };

  const parsed = scenarioSchema.safeParse({
    name: formData.get("name"),
    triggerType: formData.get("triggerType"),
    status: formData.get("status"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    const scenario = await createScenario({
      name: parsed.data.name,
      triggerType: parsed.data.triggerType,
      status: parsed.data.status,
      clientId: session.clientId,
      whiteLabelId: session.whiteLabelId,
    });
    revalidatePath("/scenarios");
    redirect(`/scenarios/${scenario.id}`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    return { error: e instanceof Error ? e.message : "作成に失敗しました。" };
  }
}

/** シナリオ更新 */
export async function updateScenarioAction(
  id: string,
  _prev: ScenarioActionState,
  formData: FormData,
): Promise<ScenarioActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  const parsed = scenarioSchema.safeParse({
    name: formData.get("name"),
    triggerType: formData.get("triggerType"),
    status: formData.get("status"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    await updateScenario(id, {
      name: parsed.data.name,
      triggerType: parsed.data.triggerType,
      status: parsed.data.status,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新に失敗しました。" };
  }

  revalidatePath("/scenarios");
  revalidatePath(`/scenarios/${id}`);
  return { error: null, success: true };
}

/** シナリオ削除 */
export async function deleteScenarioAction(
  id: string,
): Promise<ScenarioActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  try {
    await deleteScenario(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath("/scenarios");
  redirect("/scenarios");
}

/** ステップ追加 */
export async function addStepAction(
  scenarioId: string,
  _prev: ScenarioActionState,
  formData: FormData,
): Promise<ScenarioActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };
  if (!session.whiteLabelId)
    return { error: "クライアント情報が取得できませんでした。" };

  const channel = ((formData.get("channel") as string | null) ?? "email").trim() || "email";
  const parsed = stepSchema.safeParse({
    delayDays: formData.get("delayDays"),
    subject: formData.get("subject") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    await addStep({
      scenarioId,
      whiteLabelId: session.whiteLabelId,
      delayDays: parsed.data.delayDays,
      channel,
      subject: parsed.data.subject,
      body: parsed.data.body,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "追加に失敗しました。" };
  }

  revalidatePath(`/scenarios/${scenarioId}`);
  return { error: null, success: true };
}

/** ステップ更新 */
export async function updateStepAction(
  stepId: string,
  scenarioId: string,
  _prev: ScenarioActionState,
  formData: FormData,
): Promise<ScenarioActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  const channel = ((formData.get("channel") as string | null) ?? "email").trim() || "email";
  const parsed = stepSchema.safeParse({
    delayDays: formData.get("delayDays"),
    subject: formData.get("subject") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };

  try {
    await updateStep(stepId, {
      delayDays: parsed.data.delayDays,
      channel,
      subject: parsed.data.subject,
      body: parsed.data.body,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新に失敗しました。" };
  }

  revalidatePath(`/scenarios/${scenarioId}`);
  return { error: null, success: true };
}

/** ステップ削除 */
export async function deleteStepAction(
  stepId: string,
  scenarioId: string,
): Promise<ScenarioActionState> {
  const session = await getSessionProfile();
  if (session?.role !== "client_owner")
    return { error: "この操作を行う権限がありません。" };

  try {
    await deleteStep(stepId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました。" };
  }

  revalidatePath(`/scenarios/${scenarioId}`);
  return { error: null, success: true };
}
