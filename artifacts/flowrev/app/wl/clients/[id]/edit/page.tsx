import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWhiteLabelOwner } from "@/features/wl/guard";
import { getClient } from "@/lib/repositories/clients";
import { WLClientEditForm } from "@/features/wl/components/wl-client-edit-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "クライアント編集 | FlowRev WL",
};

interface Props {
  params: { id: string };
}

export default async function WLClientEditPage({ params }: Props) {
  const session = await requireWhiteLabelOwner();
  const client = await getClient(params.id, session.whiteLabelId);

  if (!client) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/wl/clients"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← クライアント管理
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          クライアント編集
        </h1>
        <p className="text-sm text-muted-foreground">
          「{client.businessName}」の情報を変更します。
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <WLClientEditForm client={client} />
      </div>
    </div>
  );
}
