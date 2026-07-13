import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lookupGenerationImage } from "@/lib/car-generation-images";
import { groupGenerationsForDisplay } from "@/lib/car-generation-groups";
import { isRealCarPhoto } from "@/lib/car-images";
import {
  getMemoryGenerations,
  getMemoryModel,
  isMemoryCarId,
  memoryModelIdFromSlugs,
} from "@/lib/car-catalog-fallback";
import { lookupGenerationOverride } from "@/lib/car-generation-overrides";
import type { RawGeneration } from "@/lib/car-generation-groups";

export const runtime = "nodejs";

function sanitizeRawGenerations(gens: RawGeneration[]): RawGeneration[] {
  const hasReal = gens.some((g) => g.code && g.code !== "ALL");
  let list = hasReal ? gens.filter((g) => g.code !== "ALL") : gens;

  const seen = new Set<string>();
  list = list.filter((g) => {
    const key = g.code.trim().toUpperCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return list;
}

function enrichGenerationPhoto(
  gen: RawGeneration,
  brandSlug: string,
  modelSlug: string
) {
  if (isRealCarPhoto(gen.imageUrl)) return gen;
  const cached = lookupGenerationImage(brandSlug, modelSlug, gen.code);
  if (cached) return { ...gen, imageUrl: cached };
  return gen;
}

function formatOverrideGenerations(
  override: NonNullable<ReturnType<typeof lookupGenerationOverride>>,
  modelId: string,
  brandSlug: string,
  modelSlug: string
) {
  return override
    .map((g) => {
      const id = `mem-gen-${brandSlug}-${modelSlug}-${g.code}`;
      const enriched = enrichGenerationPhoto(
        {
          id,
          code: g.code,
          name: g.name,
          yearFrom: g.yearFrom,
          yearTo: g.yearTo,
          imageUrl: g.imageUrl,
          modelId,
        },
        brandSlug,
        modelSlug
      );
      return {
        ...enriched,
        code: g.name,
        name: g.name,
        variants: [{ id, code: g.code, label: g.name }],
      };
    })
    .sort(
      (a, b) =>
        b.yearFrom - a.yearFrom || (b.yearTo ?? 9999) - (a.yearTo ?? 9999)
    );
}

function enrichMemoryGenerations(
  modelId: string,
  brandSlug: string,
  modelSlug: string,
  modelName?: string
) {
  const override = lookupGenerationOverride(brandSlug, modelSlug, modelName);
  if (override) {
    return formatOverrideGenerations(override, modelId, brandSlug, modelSlug);
  }

  const source = sanitizeRawGenerations(getMemoryGenerations(modelId));

  const generations = source.map((gen) =>
    enrichGenerationPhoto(gen, brandSlug, modelSlug)
  );

  const grouped = groupGenerationsForDisplay(generations, brandSlug, modelSlug);
  grouped.sort(
    (a, b) =>
      b.yearFrom - a.yearFrom || (b.yearTo ?? 9999) - (a.yearTo ?? 9999)
  );

  return grouped.map((group) => {
    if (isRealCarPhoto(group.imageUrl)) return group;
    for (const variant of group.variants) {
      const cached = lookupGenerationImage(brandSlug, modelSlug, variant.code);
      if (cached) return { ...group, imageUrl: cached };
    }
    return group;
  });
}

export async function GET(req: NextRequest) {
  const modelId = req.nextUrl.searchParams.get("modelId");
  if (!modelId) {
    return NextResponse.json({ error: "modelId required" }, { status: 400 });
  }

  if (isMemoryCarId(modelId)) {
    const model = getMemoryModel(modelId);
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json(
      enrichMemoryGenerations(modelId, model.brandSlug, model.slug, model.name)
    );
  }

  const model = await prisma.carModel.findUnique({
    where: { id: modelId },
    select: { slug: true, name: true, brand: { select: { slug: true } } },
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

  const override = lookupGenerationOverride(model.brand.slug, model.slug, model.name);
  if (override) {
    return NextResponse.json(
      enrichMemoryGenerations(modelId, model.brand.slug, model.slug, model.name)
    );
  }

  if (generations.length === 0) {
    const memModelId = memoryModelIdFromSlugs(model.brand.slug, model.slug);
    const memGens = getMemoryGenerations(memModelId);
    if (memGens.length > 0) {
      return NextResponse.json(
        enrichMemoryGenerations(memModelId, model.brand.slug, model.slug, model.name)
      );
    }
  }

  const enriched = sanitizeRawGenerations(generations).map((gen) =>
    enrichGenerationPhoto(gen, model.brand.slug, model.slug)
  );

  const grouped = groupGenerationsForDisplay(enriched, model.brand.slug, model.slug);
  grouped.sort(
    (a, b) =>
      b.yearFrom - a.yearFrom || (b.yearTo ?? 9999) - (a.yearTo ?? 9999)
  );

  const withPhotos = grouped.map((group) => {
    if (isRealCarPhoto(group.imageUrl)) return group;
    for (const variant of group.variants) {
      const cached = lookupGenerationImage(model.brand.slug, model.slug, variant.code);
      if (cached) return { ...group, imageUrl: cached };
    }
    if (group.imageUrl?.includes("car-logos-dataset")) {
      return { ...group, imageUrl: "__pending__" };
    }
    return group;
  });

  return NextResponse.json(withPhotos);
}
