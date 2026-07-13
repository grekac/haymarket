import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  extendPromotionUntil,
  getPromotionPackage,
  isListingPromoted,
} from "@/lib/promotion";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const packageId = body.package ?? "basic";
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

  const currentUntil =
    isListingPromoted(listing) && listing.promotedUntil ? new Date(listing.promotedUntil) : null;
  const until = extendPromotionUntil(currentUntil, pkg.days);

  const [updated, order] = await prisma.$transaction([
    prisma.listing.update({
      where: { id },
      data: { isPromoted: true, promotedUntil: until },
    }),
    prisma.promotionOrder.create({
      data: {
        listingId: id,
        userId: session.id,
        package: pkg.id,
        days: pkg.days,
        amount: pkg.amount,
        status: "PAID",
        provider: process.env.STRIPE_SECRET_KEY ? "stripe" : "demo",
      },
    }),
  ]);

  return NextResponse.json({
    listing: updated,
    order: { id: order.id, amount: order.amount, package: order.package, days: order.days },
    promotedUntil: until,
  });
}
