import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { createCustomerAction } from "@/features/customers/actions";

export const dynamic = "force-dynamic";

export default function NewCustomerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          顧客一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">顧客を登録</h1>
      </div>

      <CustomerForm
        action={createCustomerAction}
        submitLabel="登録して詳細へ"
      />
    </div>
  );
}
