import Link from "next/link";
import { InvitationForm } from "@/features/invitations/components/invitation-form";
import { listPlans } from "@/lib/repositories/plans";
import { requireWhiteLabelOwner } from "@/features/wl/guard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "クライアント招待 | FlowRev",
};

export default async function NewClientInvitationPage() {
  await requireWhiteLabelOwner();
  const plans = await listPlans();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">クライアント招待</h1>
        <p className="text-sm text-muted-foreground">
          クライアントを招待します。作成後に表示される招待URLを共有してください。
        </p>
      </div>

      <InvitationForm plans={plans} />

      <Link
        href="/wl/clients"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← クライアント一覧へ戻る
      </Link>
    </main>
  );
}
