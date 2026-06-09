import { createClient } from "@/lib/supabase/server";

export interface ScenarioRow {
  id: string;
  whiteLabelId: string;
  clientId: string;
  name: string;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  status: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  stepCount?: number;
}

export interface StepRow {
  id: string;
  whiteLabelId: string;
  scenarioId: string;
  stepNumber: number;
  delayDays: number;
  channel: string;
  subject: string | null;
  body: string;
  aiGenerated: boolean;
  createdAt: string;
}

export interface CreateScenarioInput {
  name: string;
  triggerType: string;
  status: string;
  clientId: string;
  whiteLabelId: string;
}

export interface UpdateScenarioInput {
  name?: string;
  triggerType?: string;
  status?: string;
}

export interface CreateStepInput {
  scenarioId: string;
  whiteLabelId: string;
  delayDays: number;
  subject?: string;
  body: string;
}

export interface UpdateStepInput {
  delayDays?: number;
  subject?: string;
  body?: string;
}

const SCENARIO_COLS =
  "id, white_label_id, client_id, name, trigger_type, trigger_config, status, ai_generated, created_at, updated_at";

const STEP_COLS =
  "id, white_label_id, scenario_id, step_number, delay_days, channel, subject, body, ai_generated, created_at";

function mapScenario(r: Record<string, unknown>): ScenarioRow {
  return {
    id: r.id as string,
    whiteLabelId: r.white_label_id as string,
    clientId: r.client_id as string,
    name: r.name as string,
    triggerType: (r.trigger_type as string) ?? "manual",
    triggerConfig: (r.trigger_config as Record<string, unknown>) ?? {},
    status: r.status as string,
    aiGenerated: (r.ai_generated as boolean) ?? false,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    stepCount: typeof r.step_count === "number" ? r.step_count : undefined,
  };
}

function mapStep(r: Record<string, unknown>): StepRow {
  return {
    id: r.id as string,
    whiteLabelId: r.white_label_id as string,
    scenarioId: r.scenario_id as string,
    stepNumber: r.step_number as number,
    delayDays: (r.delay_days as number) ?? 0,
    channel: (r.channel as string) ?? "email",
    subject: (r.subject as string) ?? null,
    body: r.body as string,
    aiGenerated: (r.ai_generated as boolean) ?? false,
    createdAt: r.created_at as string,
  };
}

/** シナリオ一覧（ステップ数付き） */
export async function listScenarios(): Promise<ScenarioRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("follow_scenarios")
    .select(`${SCENARIO_COLS}, scenario_steps(count)`)
    .order("created_at", { ascending: false });

  if (error)
    throw new Error(`シナリオ一覧の取得に失敗しました: ${error.message}`);

  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const steps = row.scenario_steps as Array<{ count: number }> | undefined;
    return mapScenario({ ...row, step_count: steps?.[0]?.count ?? 0 });
  });
}

/** シナリオ1件取得 */
export async function getScenario(id: string): Promise<ScenarioRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("follow_scenarios")
    .select(SCENARIO_COLS)
    .eq("id", id)
    .maybeSingle();

  if (error)
    throw new Error(`シナリオの取得に失敗しました: ${error.message}`);
  if (!data) return null;
  return mapScenario(data as Record<string, unknown>);
}

/** シナリオ作成 */
export async function createScenario(
  input: CreateScenarioInput,
): Promise<ScenarioRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("follow_scenarios")
    .insert({
      name: input.name,
      trigger_type: input.triggerType,
      status: input.status,
      client_id: input.clientId,
      white_label_id: input.whiteLabelId,
    })
    .select(SCENARIO_COLS)
    .single();

  if (error || !data)
    throw new Error(
      `シナリオの作成に失敗しました: ${error?.message ?? "不明"}`,
    );
  return mapScenario(data as Record<string, unknown>);
}

/** シナリオ更新 */
export async function updateScenario(
  id: string,
  input: UpdateScenarioInput,
): Promise<ScenarioRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("follow_scenarios")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.triggerType !== undefined && {
        trigger_type: input.triggerType,
      }),
      ...(input.status !== undefined && { status: input.status }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(SCENARIO_COLS)
    .single();

  if (error || !data)
    throw new Error(
      `シナリオの更新に失敗しました: ${error?.message ?? "不明"}`,
    );
  return mapScenario(data as Record<string, unknown>);
}

/** シナリオ削除（ステップは CASCADE） */
export async function deleteScenario(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("follow_scenarios")
    .delete()
    .eq("id", id);
  if (error)
    throw new Error(`シナリオの削除に失敗しました: ${error.message}`);
}

/** ステップ一覧（step_number 昇順） */
export async function listSteps(scenarioId: string): Promise<StepRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scenario_steps")
    .select(STEP_COLS)
    .eq("scenario_id", scenarioId)
    .order("step_number", { ascending: true });

  if (error)
    throw new Error(`ステップ一覧の取得に失敗しました: ${error.message}`);
  return (data ?? []).map((r) => mapStep(r as Record<string, unknown>));
}

/** ステップ追加（step_number は現在の最大値 + 1） */
export async function addStep(input: CreateStepInput): Promise<StepRow> {
  const supabase = createClient();

  const { data: maxData } = await supabase
    .from("scenario_steps")
    .select("step_number")
    .eq("scenario_id", input.scenarioId)
    .order("step_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber =
    ((maxData as Record<string, unknown> | null)?.step_number as number ?? 0) + 1;

  const { data, error } = await supabase
    .from("scenario_steps")
    .insert({
      scenario_id: input.scenarioId,
      white_label_id: input.whiteLabelId,
      step_number: nextNumber,
      delay_days: input.delayDays,
      subject: input.subject ?? null,
      body: input.body,
    })
    .select(STEP_COLS)
    .single();

  if (error || !data)
    throw new Error(
      `ステップの追加に失敗しました: ${error?.message ?? "不明"}`,
    );
  return mapStep(data as Record<string, unknown>);
}

/** ステップ更新 */
export async function updateStep(
  id: string,
  input: UpdateStepInput,
): Promise<StepRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scenario_steps")
    .update({
      ...(input.delayDays !== undefined && { delay_days: input.delayDays }),
      ...(input.subject !== undefined && { subject: input.subject }),
      ...(input.body !== undefined && { body: input.body }),
    })
    .eq("id", id)
    .select(STEP_COLS)
    .single();

  if (error || !data)
    throw new Error(
      `ステップの更新に失敗しました: ${error?.message ?? "不明"}`,
    );
  return mapStep(data as Record<string, unknown>);
}

/** ステップ削除 */
export async function deleteStep(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("scenario_steps")
    .delete()
    .eq("id", id);
  if (error)
    throw new Error(`ステップの削除に失敗しました: ${error.message}`);
}
