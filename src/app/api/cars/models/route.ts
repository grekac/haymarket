import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  filterCarModelsForListing,
  sortModelsForDisplay,
  stripModelGenerations,
} from "@/lib/car-model-filters";
import {
  getMemoryModels,
  isMemoryCarId,
  memoryBrandIdFromSlug,
} from "@/lib/car-catalog-fallback";

export const runtime = "nodejs";

function buildMemoryModelsResponse(
  brandId: string,
  q: string,
  carsOnly: boolean
) {
  const models = getMemoryModels(brandId, q || undefined).map((m) => ({
    ...m,
    generations: [{ code: "ALL" as const }],
  }));
  const filtered = sortModelsForDisplay(
    carsOnly ? filterCarModelsForListing(models) : models
  );
  return stripModelGenerations(filtered);
}

async function resolveBrandSlug(brandId: string): Promise<string | null> {
  if (isMemoryCarId(brandId)) {
    const slug = brandId.slice("mem-brand-".length);
    return slug.length > 0 ? slug : null;
  }
  const brand = await prisma.carBrand.findUnique({
    where: { id: brandId },
    select: { slug: true },
  });
  return brand?.slug ?? null;
}

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brandId");
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const all = req.nextUrl.searchParams.get("all") === "1";
  const carsOnly = req.nextUrl.searchParams.get("carsOnly") !== "0";

  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  if (isMemoryCarId(brandId)) {
    return NextResponse.json(buildMemoryModelsResponse(brandId, q, carsOnly));
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

    if (models.length === 0) {
      const slug = await resolveBrandSlug(brandId);
      if (slug) {
        return NextResponse.json(
          buildMemoryModelsResponse(memoryBrandIdFromSlug(slug), q, carsOnly)
        );
      }
    }

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

  if (result.length === 0) {
    const slug = await resolveBrandSlug(brandId);
    if (slug) {
      return NextResponse.json(
        buildMemoryModelsResponse(memoryBrandIdFromSlug(slug), q, carsOnly)
      );
    }
  }

  return NextResponse.json(stripModelGenerations(result));
}
