import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getBodyVariantLabel,
  getGenerationGroupKey,
  getPrimaryGenerationCode,
} from "@/lib/car-generation-groups";

export async function GET(req: NextRequest) {
  const modelId = req.nextUrl.searchParams.get("modelId");
  const generation = req.nextUrl.searchParams.get("generation");
  if (!modelId || !generation) {
    return NextResponse.json({ error: "modelId and generation required" }, { status: 400 });
  }

  const model = await prisma.carModel.findUnique({
    where: { id: modelId },
    select: { brand: { select: { slug: true } } },
  });
  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  const gens = await prisma.carGeneration.findMany({
    where: { modelId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, code: true },
  });

  const brandSlug = model.brand.slug;
  const allCodes = gens.map((g) => g.code);
  const groupKey = getGenerationGroupKey(generation, brandSlug, allCodes);
  const variants = gens
    .filter((g) => getGenerationGroupKey(g.code, brandSlug, allCodes) === groupKey)
    .map((g) => ({
      id: g.id,
      code: g.code,
      label: getBodyVariantLabel(g.code, brandSlug),
    }));

  const primaryCode = getPrimaryGenerationCode(variants.map((v) => v.code), brandSlug);

  return NextResponse.json({ primaryCode, variants });
}
