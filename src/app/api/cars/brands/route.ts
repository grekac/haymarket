import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POPULAR_BRAND_SLUGS } from "@/lib/car-logos";
import { getMemoryBrands } from "@/lib/car-catalog-fallback";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const popular = req.nextUrl.searchParams.get("popular") === "1";
  const all = req.nextUrl.searchParams.get("all") === "1";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "0") || 0, 5000);

  const select = { id: true, name: true, slug: true, logoUrl: true } as const;

  if (all) {
    const brands = await prisma.carBrand.findMany({
      orderBy: { name: "asc" },
      select,
    });
    if (brands.length === 0) {
      return NextResponse.json(getMemoryBrands({ all: true }));
    }
    return NextResponse.json(brands);
  }

  if (q) {
    const brands = await prisma.carBrand.findMany({
      where: { name: { contains: q } },
      orderBy: { name: "asc" },
      take: limit || 300,
      select,
    });
    const filtered = brands.filter((b) => b.name.toLowerCase().includes(q.toLowerCase()));
    const result = filtered.length ? filtered : brands;
    if (result.length === 0) {
      return NextResponse.json(getMemoryBrands({ q, limit: limit || 300 }));
    }
    return NextResponse.json(result);
  }

  if (popular) {
    const brands = await prisma.carBrand.findMany({
      where: { slug: { in: POPULAR_BRAND_SLUGS } },
      select,
    });
    if (brands.length === 0) {
      return NextResponse.json(getMemoryBrands({ popular: true }));
    }
    const order = new Map(POPULAR_BRAND_SLUGS.map((s, i) => [s, i]));
    brands.sort((a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999));
    return NextResponse.json(brands);
  }

  const brands = await prisma.carBrand.findMany({
    orderBy: { name: "asc" },
    take: limit || 500,
    select,
  });

  if (brands.length === 0) {
    return NextResponse.json(getMemoryBrands({ limit: limit || 500 }));
  }

  return NextResponse.json(brands);
}
