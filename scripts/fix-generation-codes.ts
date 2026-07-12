/**
 * Пересоздаёт поколения из каталога (исправляет битые коды Honda/Subaru и т.д.)
 * Сохраняет фото по коду. Run: npm run db:fix-generations
 */
import { PrismaClient } from "@prisma/client";
import { buildCarCatalogFromPackage } from "../src/lib/car-catalog-builder";

function isValidGenerationCode(code: string, brandSlug?: string, modelSlug?: string): boolean {
  if (!code || code === "ALL") return true;
  if (/^\d+$/.test(code)) return false;
  const bmw3 = new Set(["3-er-reihe", "series-3", "3-series", "3er"]);
  if (brandSlug === "bmw" && modelSlug && bmw3.has(modelSlug) && /^F3[236]$/.test(code)) return false;
  return true;
}

function normModelKey(slug: string, name?: string) {
  return (name ?? slug).toLowerCase().trim().replace(/-class$/i, "").replace(/[^a-z0-9]/g, "");
}

async function applyGenerations(
  modelId: string,
  newGens: { code: string; name: string; yearFrom: number; yearTo: number | null; imageUrl: string }[],
  oldGens: { code: string; imageUrl: string }[]
) {
  const oldCodes = oldGens.map((g) => g.code).sort().join("|");
  const newCodes = newGens.map((g) => g.code).sort().join("|");
  if (oldCodes === newCodes) return false;

  const photoByCode = new Map(
    oldGens.filter((g) => g.imageUrl && g.imageUrl !== "__pending__").map((g) => [g.code, g.imageUrl])
  );

  await prisma.carGeneration.deleteMany({ where: { modelId } });
  await prisma.carGeneration.createMany({
    data: newGens.map((gen, gi) => ({
      modelId,
      code: gen.code,
      name: gen.name,
      yearFrom: gen.yearFrom,
      yearTo: gen.yearTo,
      imageUrl: photoByCode.get(gen.code) ?? gen.imageUrl,
      sortOrder: gi,
    })),
  });
  return true;
}

const prisma = new PrismaClient();
const BATCH = 500;

async function main() {
  const catalog = buildCarCatalogFromPackage();
  const brands = await prisma.carBrand.findMany({ select: { id: true, slug: true } });
  const brandIdBySlug = new Map(brands.map((b) => [b.slug, b.id]));

  const models = await prisma.carModel.findMany({
    select: { id: true, slug: true, name: true, brandId: true, brand: { select: { slug: true } } },
  });
  const modelsByBrandNorm = new Map<string, typeof models>();
  for (const m of models) {
    const key = `${m.brand.slug}|${normModelKey(m.slug, m.name)}`;
    const list = modelsByBrandNorm.get(key) ?? [];
    list.push(m);
    modelsByBrandNorm.set(key, list);
  }

  let updated = 0;
  let genCount = 0;

  for (const brand of catalog) {
    const brandId = brandIdBySlug.get(brand.slug);
    if (!brandId) continue;

    for (const model of brand.models) {
      const newGens = model.generations.filter((gen) =>
        isValidGenerationCode(gen.code, brand.slug, model.slug)
      );
      if (newGens.length === 0) continue;

      const targets = modelsByBrandNorm.get(`${brand.slug}|${normModelKey(model.slug, model.name)}`) ?? [];
      for (const dbModel of targets) {
        const oldGens = await prisma.carGeneration.findMany({
          where: { modelId: dbModel.id },
          select: { code: true, imageUrl: true },
        });

        const changed = await applyGenerations(dbModel.id, newGens, oldGens);
        if (!changed) continue;
        updated++;
        genCount += newGens.length;
      }
    }
  }

  console.log(`✓ Fixed ${updated} models, ${genCount} generations refreshed`);
}

main().finally(() => prisma.$disconnect());
