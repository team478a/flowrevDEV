import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  customerTotal: number;
  customerNewThisWeek: number;
  customerInactive: number;
  productTotal: number;
  lpTotal: number;
  courseTotal: number;
  scenarioActive: number;
}

export interface RecentCustomer {
  id: string;
  name: string | null;
  email: string;
  source: string;
  createdAt: string;
}

const INACTIVE_DAYS = 7;

function startOfWeekIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6); // 過去7日
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function inactiveThresholdIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - INACTIVE_DAYS);
  return d.toISOString();
}

async function countTable(
  supabase: ReturnType<typeof createClient>,
  table: string,
  filters?: Record<string, string>,
): Promise<number> {
  let q = supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (filters) {
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }
  }
  const { count } = await q;
  return count ?? 0;
}

export interface GetDashboardStatsOptions {
  whiteLabelId?: string | null;
}

export async function getDashboardStats(
  options: GetDashboardStatsOptions = {},
): Promise<DashboardStats> {
  const supabase = createClient();
  const { whiteLabelId } = options;

  const tenantFilter: Record<string, string> = whiteLabelId
    ? { white_label_id: whiteLabelId }
    : {};

  const [
    customerTotal,
    customerNewThisWeek,
    productTotal,
    lpTotal,
    courseTotal,
    scenarioActive,
  ] = await Promise.all([
    countTable(supabase, "customers", tenantFilter),
    (() => {
      let q = supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfWeekIso());
      if (whiteLabelId) q = q.eq("white_label_id", whiteLabelId);
      return q.then(({ count }) => count ?? 0);
    })(),
    countTable(supabase, "products", tenantFilter),
    countTable(supabase, "landing_pages", tenantFilter),
    countTable(supabase, "courses", tenantFilter),
    countTable(supabase, "follow_scenarios", {
      ...tenantFilter,
      status: "active",
    }),
  ]);

  // 未アクション：last_action_at が null、または閾値より古い
  const staleQ = (() => {
    let q = supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .lt("last_action_at", inactiveThresholdIso());
    if (whiteLabelId) q = q.eq("white_label_id", whiteLabelId);
    return q;
  })();

  const untouchedQ = (() => {
    let q = supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .is("last_action_at", null);
    if (whiteLabelId) q = q.eq("white_label_id", whiteLabelId);
    return q;
  })();

  const [{ count: staleCount }, { count: untouchedCount }] = await Promise.all(
    [staleQ, untouchedQ],
  );

  const customerInactive = (staleCount ?? 0) + (untouchedCount ?? 0);

  return {
    customerTotal,
    customerNewThisWeek,
    customerInactive,
    productTotal,
    lpTotal,
    courseTotal,
    scenarioActive,
  };
}

export interface CustomerTrendPoint {
  date: string;  // YYYY-MM-DD（集計・ソートキー）
  label: string; // MM/DD（グラフ表示用）
  count: number;
}

export interface GetCustomerTrendOptions {
  whiteLabelId?: string | null;
  from?: string;
  to?: string;
}

/** ISO 文字列を JST の YYYY-MM-DD キーに変換する（年跨ぎ衝突を防ぐ） */
function toJstDateKey(isoString: string): string {
  const d = new Date(isoString);
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getCustomerRegistrationTrend(
  options: GetCustomerTrendOptions = {},
): Promise<CustomerTrendPoint[]> {
  const supabase = createClient();
  const { whiteLabelId, from, to } = options;

  let q = supabase
    .from("customers")
    .select("created_at")
    .order("created_at", { ascending: true });

  if (whiteLabelId) q = q.eq("white_label_id", whiteLabelId);
  if (from) q = q.gte("created_at", `${from}T00:00:00.000Z`);
  if (to) q = q.lte("created_at", `${to}T23:59:59.999Z`);

  const { data } = await q;
  const rows = (data ?? []) as Record<string, unknown>[];
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const key = toJstDateKey(row.created_at as string);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  // YYYY-MM-DD は辞書順＝日付順で正しくソートされる
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      label: date.slice(5).replace("-", "/"), // "MM/DD"
      count,
    }));
}

export async function getRecentCustomers(
  limit = 5,
  options: GetDashboardStatsOptions = {},
): Promise<RecentCustomer[]> {
  const supabase = createClient();
  const { whiteLabelId } = options;

  let q = supabase
    .from("customers")
    .select("id, name, email, source, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (whiteLabelId) q = q.eq("white_label_id", whiteLabelId);

  const { data } = await q;

  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id as string,
      name: (row.name as string) ?? null,
      email: row.email as string,
      source: (row.source as string) ?? "manual",
      createdAt: row.created_at as string,
    };
  });
}
