import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveGenerationImage, isPlaceholderImage, isRealCarPhoto } from "@/lib/car-images";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
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

  const gens = await prisma.carGeneration.findMany({
    where: { id: { in: ids.slice(0, 24) } },
    include: { model: { include: { brand: true } } },
  });

  const results: Record<string, string | null> = {};

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
