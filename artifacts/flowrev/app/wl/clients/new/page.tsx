import Link from "next/link";
import { InvitationForm } from "@/features/invitations/components/invitation-form";
import { listPlans } from "@/lib/repositories/plans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "クライアント招待 | FlowRev",
};

export default async function NewClientInvitationPage() {
  const plans = await listPlans();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/wl/clients"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← クライアント一覧
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          クライアント招待
        </h1>
        <p className="text-sm text-muted-foreground">
          クライアントを招待します。登録後にメールまたは表示URLを共有してください。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <InvitationForm plans={plans} />
      </div>
    </div>
  );
}
