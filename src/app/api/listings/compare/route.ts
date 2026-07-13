import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (ids.length === 0) return NextResponse.json([]);

  const listings = await prisma.listing.findMany({
    where: { id: { in: ids.slice(0, 4) }, status: "ACTIVE" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      carDetails: true,
      realEstate: true,
    },
  });

  const ordered = ids.map((id) => listings.find((l) => l.id === id)).filter(Boolean);
  return NextResponse.json(ordered);
}
