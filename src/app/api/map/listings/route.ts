import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { haversineKm } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = sp.get("lat") ? Number(sp.get("lat")) : 40.1776;
  const lng = sp.get("lng") ? Number(sp.get("lng")) : 44.5126;
  const radius = sp.get("radius") ? Number(sp.get("radius")) : 50;
  const category = sp.get("category") ?? undefined;

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      latitude: { not: null },
      longitude: { not: null },
      ...(category ? { category: { slug: category } } : {}),
    },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: { select: { name: true, slug: true } },
    },
    take: 200,
  });

  const items = listings
    .map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      currency: l.currency,
      city: l.city,
      latitude: l.latitude!,
      longitude: l.longitude!,
      image: l.images[0]?.url ?? null,
      category: l.category.name,
      isPromoted: l.isPromoted,
      distanceKm: haversineKm(lat, lng, l.latitude!, l.longitude!),
    }))
    .filter((l) => l.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return NextResponse.json({ items, center: { lat, lng } });
}
