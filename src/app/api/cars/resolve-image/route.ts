import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  resolveGenerationImage,
  isPlaceholderImage,
  isRealCarPhoto,
} from "@/lib/car-images";
import { lookupGenerationImage } from "@/lib/car-generation-images";
import { getMemoryGeneration, isMemoryCarId } from "@/lib/car-catalog-fallback";

async function resolveMemoryGenerationImage(genId: string) {
  const gen = getMemoryGeneration(genId);
  if (!gen) return null;

  if (isRealCarPhoto(gen.imageUrl)) return gen.imageUrl;

  const cached = lookupGenerationImage(gen.brandSlug, gen.modelSlug, gen.code);
  if (isRealCarPhoto(cached)) return cached;

  return resolveGenerationImage(
    gen.brandName,
    gen.modelName,
    gen.code,
    undefined,
    gen.brandSlug,
    gen.modelSlug
  );
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  if (isMemoryCarId(id)) {
    const url = await resolveMemoryGenerationImage(id);
    return NextResponse.json({ url: isRealCarPhoto(url) ? url : null });
  }

  const gen = await prisma.carGeneration.findUnique({
    where: { id },
    include: { model: { include: { brand: true } } },
  });

  if (!gen) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isPlaceholderImage(gen.imageUrl)) {
    const url = isRealCarPhoto(gen.imageUrl) ? gen.imageUrl : null;
    return NextResponse.json({ url });
  }

  const url = await resolveGenerationImage(
    gen.model.brand.name,
    gen.model.name,
    gen.code,
    gen.model.brand.logoUrl,
    gen.model.brand.slug,
    gen.model.slug
  );

  if (url && isRealCarPhoto(url)) {
    await prisma.carGeneration.update({
      where: { id },
      data: { imageUrl: url },
    });
    return NextResponse.json({ url });
  }

  return NextResponse.json({ url: null });
}

/** Batch resolve visible generation images */
export async function POST(req: NextRequest) {
  const { ids } = (await req.json()) as { ids?: string[] };
  if (!ids?.length) {
    return NextResponse.json({ results: {} });
  }

  const results: Record<string, string | null> = {};
  const dbIds = ids.slice(0, 24).filter((id) => !isMemoryCarId(id));
  const memIds = ids.slice(0, 24).filter((id) => isMemoryCarId(id));

  for (const id of memIds) {
    const url = await resolveMemoryGenerationImage(id);
    results[id] = isRealCarPhoto(url) ? url : null;
  }

  if (!dbIds.length) {
    return NextResponse.json({ results });
  }

  const gens = await prisma.carGeneration.findMany({
    where: { id: { in: dbIds } },
    include: { model: { include: { brand: true } } },
  });

  for (const gen of gens) {
    if (!isPlaceholderImage(gen.imageUrl)) {
      results[gen.id] = isRealCarPhoto(gen.imageUrl) ? gen.imageUrl : null;
      continue;
    }

    const url = await resolveGenerationImage(
      gen.model.brand.name,
      gen.model.name,
      gen.code,
      gen.model.brand.logoUrl,
      gen.model.brand.slug,
      gen.model.slug
    );

    if (url && isRealCarPhoto(url)) {
      await prisma.carGeneration.update({
        where: { id: gen.id },
        data: { imageUrl: url },
      });
      results[gen.id] = url;
      continue;
    }

    results[gen.id] = null;
  }

  return NextResponse.json({ results });
}
