import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  filterCarModelsForListing,
  sortModelsForDisplay,
  stripModelGenerations,
} from "@/lib/car-model-filters";
import { getMemoryModels, isMemoryCarId } from "@/lib/car-catalog-fallback";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brandId");
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const all = req.nextUrl.searchParams.get("all") === "1";
  const carsOnly = req.nextUrl.searchParams.get("carsOnly") !== "0";

  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  if (isMemoryCarId(brandId)) {
    const models = getMemoryModels(brandId, q || undefined).map((m) => ({
      ...m,
      generations: [{ code: "ALL" }],
    }));
    const filtered = sortModelsForDisplay(
      carsOnly ? filterCarModelsForListing(models) : models
    );
    return NextResponse.json(stripModelGenerations(filtered));
  }

  const select = {
    id: true,
    name: true,
    slug: true,
    brandId: true,
    generations: { select: { code: true } },
  } as const;

  if (all) {
    const models = await prisma.carModel.findMany({
      where: { brandId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select,
    });

    const filtered = sortModelsForDisplay(
      carsOnly ? filterCarModelsForListing(models) : models
    );
    return NextResponse.json(stripModelGenerations(filtered));
  }

  const models = await prisma.carModel.findMany({
    where: {
      brandId,
      ...(q ? { name: { contains: q } } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: q ? 200 : 5000,
    select,
  });

  let result = sortModelsForDisplay(carsOnly ? filterCarModelsForListing(models) : models);

  if (q) {
    const lower = q.toLowerCase();
    result = result.filter((m) => m.name.toLowerCase().includes(lower));
  }

  return NextResponse.json(stripModelGenerations(result));
}
