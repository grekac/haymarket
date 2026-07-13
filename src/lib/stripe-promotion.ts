import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  extendPromotionUntil,
  getPromotionPackage,
  isListingPromoted,
  type PromotionPackageId,
} from "@/lib/promotion";

let stripeClient: Stripe | null = null;

export function isStripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

function appBaseUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return base.startsWith("http") ? base.replace(/\/$/, "") : `https://${base}`;
}

export async function fulfillPromotionOrder(orderId: string) {
  const order = await prisma.promotionOrder.findUnique({
    where: { id: orderId },
    include: { listing: true },
  });

  if (!order || order.status === "PAID") return order;

  const listing = order.listing;
  const currentUntil =
    isListingPromoted(listing) && listing.promotedUntil
      ? new Date(listing.promotedUntil)
      : null;
  const until = extendPromotionUntil(currentUntil, order.days);

  const [updatedListing, updatedOrder] = await prisma.$transaction([
    prisma.listing.update({
      where: { id: order.listingId },
      data: { isPromoted: true, promotedUntil: until },
    }),
    prisma.promotionOrder.update({
      where: { id: order.id },
      data: { status: "PAID" },
    }),
  ]);

  const { notifyUser } = await import("@/lib/notifications");
  await notifyUser({
    userId: order.userId,
    type: "promotion_paid",
    title: "Продвижение активировано",
    body: `Объявление «${listing.title}» в ТОПе до ${until.toLocaleDateString("ru-RU")}`,
    link: `/listing/${listing.id}`,
  }).catch(() => {});

  return { order: updatedOrder, listing: updatedListing, promotedUntil: until };
}

export async function createPromotionCheckout(opts: {
  listingId: string;
  userId: string;
  packageId: PromotionPackageId;
  locale?: string;
}) {
  const pkg = getPromotionPackage(opts.packageId);
  if (!pkg) throw new Error("Invalid package");

  const listing = await prisma.listing.findUnique({ where: { id: opts.listingId } });
  if (!listing) throw new Error("Listing not found");

  const order = await prisma.promotionOrder.create({
    data: {
      listingId: opts.listingId,
      userId: opts.userId,
      package: pkg.id,
      days: pkg.days,
      amount: pkg.amount,
      currency: "AMD",
      status: "PENDING",
      provider: "stripe",
    },
  });

  const stripe = getStripe();
  const locale = opts.locale === "ru" ? "ru" : "hy";
  const base = appBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "amd",
          unit_amount: pkg.amount,
          product_data: {
            name: `HayMarket ТОП · ${pkg.days} дн.`,
            description: listing.title.slice(0, 120),
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      listingId: opts.listingId,
      userId: opts.userId,
      package: pkg.id,
    },
    success_url: `${base}/${locale}/profile?promoted=success`,
    cancel_url: `${base}/${locale}/profile?promoted=cancel`,
  });

  await prisma.promotionOrder.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return { orderId: order.id, checkoutUrl: session.url };
}

export async function fulfillPromotionBySessionId(sessionId: string) {
  const order = await prisma.promotionOrder.findUnique({
    where: { stripeSessionId: sessionId },
  });
  if (!order) return null;
  return fulfillPromotionOrder(order.id);
}

export async function processDemoPromotion(opts: {
  listingId: string;
  userId: string;
  packageId: PromotionPackageId;
}) {
  const pkg = getPromotionPackage(opts.packageId);
  if (!pkg) throw new Error("Invalid package");

  const listing = await prisma.listing.findUnique({ where: { id: opts.listingId } });
  if (!listing) throw new Error("Listing not found");

  const currentUntil =
    isListingPromoted(listing) && listing.promotedUntil
      ? new Date(listing.promotedUntil)
      : null;
  const until = extendPromotionUntil(currentUntil, pkg.days);

  const [updated, order] = await prisma.$transaction([
    prisma.listing.update({
      where: { id: opts.listingId },
      data: { isPromoted: true, promotedUntil: until },
    }),
    prisma.promotionOrder.create({
      data: {
        listingId: opts.listingId,
        userId: opts.userId,
        package: pkg.id,
        days: pkg.days,
        amount: pkg.amount,
        status: "PAID",
        provider: "demo",
      },
    }),
  ]);

  return { listing: updated, order, promotedUntil: until };
}
