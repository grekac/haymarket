import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lookupGenerationImage } from "@/lib/car-generation-images";
import { groupGenerationsForDisplay } from "@/lib/car-generation-groups";
import { isRealCarPhoto } from "@/lib/car-images";

export async function GET(req: NextRequest) {
  const modelId = req.nextUrl.searchParams.get("modelId");
  if (!modelId) {
    return NextResponse.json({ error: "modelId required" }, { status: 400 });
  }

  const model = await prisma.carModel.findUnique({
    where: { id: modelId },
    select: { slug: true, brand: { select: { slug: true } } },
  });

  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  const generations = await prisma.carGeneration.findMany({
    where: { modelId },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      yearFrom: true,
      yearTo: true,
      imageUrl: true,
      modelId: true,
    },
  });

  const enriched = generations.map((gen) => {
    if (isRealCarPhoto(gen.imageUrl)) return gen;
    const cached = lookupGenerationImage(model.brand.slug, model.slug, gen.code);
    if (cached) return { ...gen, imageUrl: cached };
    if (gen.imageUrl?.includes("car-logos-dataset")) {
      return { ...gen, imageUrl: "__pending__" };
    }
    return gen;
  });

  const grouped = groupGenerationsForDisplay(enriched, model.brand.slug, model.slug);

  // Как на Авито: сначала новые поколения
  grouped.sort((a, b) => b.yearFrom - a.yearFrom || (b.yearTo ?? 9999) - (a.yearTo ?? 9999));

  return NextResponse.json(grouped);
}
