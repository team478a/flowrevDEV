import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCustomer } from "@/lib/repositories/customers";
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

export default async function CustomerDetailPage({ params }: Props) {
  let customer: Awaited<ReturnType<typeof getCustomer>> = null;

  try {
    customer = await getCustomer(params.id);
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
