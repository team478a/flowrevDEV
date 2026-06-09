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

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  const [
    customerTotal,
    customerNewThisWeek,
    productTotal,
    lpTotal,
    courseTotal,
    scenarioActive,
  ] = await Promise.all([
    countTable(supabase, "customers"),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfWeekIso())
      .then(({ count }) => count ?? 0),
    countTable(supabase, "products"),
    countTable(supabase, "landing_pages"),
    countTable(supabase, "courses"),
    countTable(supabase, "follow_scenarios", { status: "active" }),
  ]);

  // 未アクション：last_action_at が null、または閾値より古い
  const { count: staleCount } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .lt("last_action_at", inactiveThresholdIso());

  const { count: untouchedCount } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .is("last_action_at", null);

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

export async function getRecentCustomers(
  limit = 5,
): Promise<RecentCustomer[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("customers")
    .select("id, name, email, source, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

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
