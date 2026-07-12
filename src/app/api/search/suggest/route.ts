import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { smartSearch, tokenize } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const tokens = tokenize(q);
  const candidates = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      OR: tokens.flatMap((t) => [
        { title: { contains: t } },
        { description: { contains: t } },
      ]),
    },
    take: 30,
    select: {
      id: true, title: true, description: true, price: true, city: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: { select: { name: true } },
    },
  });

  let results = smartSearch(q, candidates.map((c) => ({ ...c, description: c.description })));

  if (results.length === 0) {
    const all = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      take: 100,
      select: {
        id: true, title: true, description: true, price: true, city: true,
        images: { take: 1 }, category: { select: { name: true } },
      },
    });
    results = smartSearch(q, all, 5);
  }

  return NextResponse.json(
    results.slice(0, 6).map(({ description: _, images, ...rest }) => ({
      ...rest,
      imageUrl: images[0]?.url ?? null,
    }))
  );
}
