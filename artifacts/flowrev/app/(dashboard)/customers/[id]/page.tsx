import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCustomer } from "@/lib/repositories/customers";
import {
  getCustomerScenarioLogs,
  type CustomerScenarioLog,
} from "@/lib/repositories/scenarios";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { DeleteCustomerButton } from "@/features/customers/components/delete-customer-button";
import {
  updateCustomerAction,
  deleteCustomerAction,
} from "@/features/customers/actions";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; cls: string }
> = {
  sent: {
    label: "送信済",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    cls: "text-green-700 bg-green-50 border-green-200",
  },
  pending: {
    label: "待機中",
    icon: <Clock className="h-3.5 w-3.5" />,
    cls: "text-amber-700 bg-amber-50 border-amber-200",
  },
  failed: {
    label: "失敗",
    icon: <XCircle className="h-3.5 w-3.5" />,
    cls: "text-red-700 bg-red-50 border-red-200",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    icon: null,
    cls: "text-muted-foreground bg-muted border-muted",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function ScenarioHistorySection({ logs }: { logs: CustomerScenarioLog[] }) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">メール配信履歴</h2>
        {logs.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {logs.length} 件
          </span>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          配信履歴はありません。
        </p>
      ) : (
        <ul className="divide-y divide-border px-5 text-sm">
          {logs.map((log) => (
            <li key={log.logId} className="flex flex-col gap-1 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium line-clamp-1">
                    {log.subject ?? `ステップ ${log.stepNumber}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {log.scenarioName} · STEP {log.stepNumber}
                  </span>
                </div>
                <StatusBadge status={log.status} />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {log.status === "sent" && log.sentAt ? (
                  <span>送信日時: {formatDate(log.sentAt)}</span>
                ) : (
                  <span>送信予定: {formatDate(log.scheduledAt)}</span>
                )}
                {log.errorMessage && (
                  <span className="text-red-500 line-clamp-1">
                    {log.errorMessage}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function CustomerDetailPage({ params }: Props) {
  let customer: Awaited<ReturnType<typeof getCustomer>> = null;
  let logs: CustomerScenarioLog[] = [];

  try {
    [customer, logs] = await Promise.all([
      getCustomer(params.id),
      getCustomerScenarioLogs(params.id),
    ]);
  } catch {
    customer = null;
  }

  if (!customer) notFound();

  const boundUpdate = updateCustomerAction.bind(null, customer.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          顧客一覧に戻る
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">
              {customer.name ?? customer.email}
            </h1>
            {customer.name && (
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={customer.status === "active" ? "default" : "secondary"}
              >
                {customer.status === "active" ? "アクティブ" : "無効"}
              </Badge>
              {customer.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <DeleteCustomerButton
            customerId={customer.id}
            customerName={customer.name ?? customer.email}
            deleteAction={deleteCustomerAction}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm max-w-sm">
        <div className="text-muted-foreground">登録日</div>
        <div>{formatDate(customer.createdAt)}</div>
        <div className="text-muted-foreground">最終アクション</div>
        <div>{formatDate(customer.lastActionAt)}</div>
        <div className="text-muted-foreground">登録元</div>
        <div>
          {customer.source === "lp"
            ? "LPから"
            : customer.source === "import"
              ? "インポート"
              : "手動登録"}
        </div>
      </div>

      <ScenarioHistorySection logs={logs} />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">基本情報を編集</h2>
        <CustomerForm
          action={boundUpdate}
          defaultValues={customer}
          submitLabel="保存する"
        />
      </section>
    </div>
  );
}
