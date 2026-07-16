import { NextRequest, NextResponse } from "next/server";
import { getStripe, fulfillPromotionBySessionId } from "@/lib/stripe-promotion";
import { fulfillVehicleHistoryBySessionId } from "@/lib/vehicle-history-billing";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    logger.warn("Stripe webhook signature failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.id) {
        if (session.metadata?.type === "vehicle_history") {
          await fulfillVehicleHistoryBySessionId(session.id);
        } else {
          await fulfillPromotionBySessionId(session.id);
        }
      }
    }
  } catch (err) {
    logger.error("Stripe webhook handler error", {
      type: event.type,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
