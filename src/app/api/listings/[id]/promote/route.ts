import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPromotionPackage } from "@/lib/promotion";
import {
  createPromotionCheckout,
  isStripeEnabled,
  processDemoPromotion,
} from "@/lib/stripe-promotion";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const packageId = (body.package ?? "basic") as string;
  const locale = typeof body.locale === "string" ? body.locale : "hy";
  const pkg = getPromotionPackage(packageId);

  if (!pkg) return NextResponse.json({ error: "Неверный пакет" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  if (listing.userId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  if (listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Можно продвигать только активные объявления" }, { status: 400 });
  }

  if (isStripeEnabled()) {
    const { checkoutUrl, orderId } = await createPromotionCheckout({
      listingId: id,
      userId: session.id,
      packageId: pkg.id,
      locale,
    });
    return NextResponse.json({ checkoutUrl, orderId, mode: "stripe" });
  }

  const result = await processDemoPromotion({
    listingId: id,
    userId: session.id,
    packageId: pkg.id,
  });

  return NextResponse.json({
    listing: result.listing,
    order: { id: result.order.id, amount: result.order.amount, package: result.order.package, days: result.order.days },
    promotedUntil: result.promotedUntil,
    mode: "demo",
  });
}
