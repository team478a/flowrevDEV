import "server-only";
import Stripe from "stripe";
import { getStripeSettingsResolved } from "@/lib/repositories/stripe-settings";

export type StripeClientResult = {
  stripe: Stripe;
  isLive: boolean;
  webhookSecret: string | null;
};

/** clientId を元に Stripe クライアントを生成して返す。未設定の場合は null。 */
export async function getStripeClient(
  clientId: string,
): Promise<StripeClientResult | null> {
  const settings = await getStripeSettingsResolved(clientId);
  if (!settings?.secretKey) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(settings.secretKey, { apiVersion: "2026-05-27.dahlia" as any });

  return {
    stripe,
    isLive: settings.isLive,
    webhookSecret: settings.webhookSecret,
  };
}
