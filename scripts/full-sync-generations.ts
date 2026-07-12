import { prisma } from "../src/lib/prisma";
import { buildCarCatalogFromPackage } from "../src/lib/car-catalog-builder";
import { normalizeModelMatchKey } from "../src/lib/car-catalog-utils";
import { getBrands, getBrand } from "auto-parts-db";

function normKey(slug: string, name?: string) {
  return normalizeModelMatchKey(name ?? slug);
}

/** VW Golf Type → Mk для отображения */
export const GENERATION_DISPLAY_ALIASES: Record<string, string> = {
  "TYPE 17": "Mk1",
  "TYPE 1G": "Mk2",
  "TYPE 1H": "Mk3",
  "TYPE 1J": "Mk4",
  "TYPE 1K": "Mk5",
  "TYPE 5K": "Mk6",
  "TYPE 5G": "Mk7",
  "TYPE 5H": "Mk8",
  FACELIFT: "Mk7 FL",
};

export function displayGenerationCode(code: string, brandSlug?: string, modelSlug?: string) {
  const c = code.toUpperCase();
  if (brandSlug === "volkswagen" && modelSlug === "golf" && GENERATION_DISPLAY_ALIASES[c]) {
    return GENERATION_DISPLAY_ALIASES[c];
  }
  return code;
}

async function main() {
  const catalog = buildCarCatalogFromPackage();
  const catMap = new Map<string, (typeof catalog)[0]["models"][0]>();
  for (const b of catalog) {
    for (const m of b.models) {
      catMap.set(`${b.slug}|${normKey(m.slug, m.name)}`, m);
    }
  }

  const dbModels = await prisma.carModel.findMany({
    include: { brand: true, generations: { select: { code: true, imageUrl: true } } },
  });

  const byNorm = new Map<string, typeof dbModels>();
  for (const m of dbModels) {
    const k = `${m.brand.slug}|${normKey(m.slug, m.name)}`;
    const list = byNorm.get(k) ?? [];
    list.push(m);
    byNorm.set(k, list);
  }

  let synced = 0;
  let gensWritten = 0;

  for (const [key, catModel] of catMap) {
    const realGens = catModel.generations.filter((g) => g.code !== "ALL");
    if (realGens.length === 0) continue;

    const targets = byNorm.get(key) ?? [];
    for (const db of targets) {
      const oldCodes = db.generations.map((g) => g.code).sort().join("|");
      const newCodes = realGens.map((g) => g.code).sort().join("|");
      if (oldCodes === newCodes) continue;

      const photos = new Map(
        db.generations
          .filter((g) => g.imageUrl && g.imageUrl !== "__pending__")
          .map((g) => [g.code, g.imageUrl])
      );

      await prisma.carGeneration.deleteMany({ where: { modelId: db.id } });
      await prisma.carGeneration.createMany({
        data: realGens.map((g, i) => ({
          modelId: db.id,
          code: g.code,
          name: g.name,
          yearFrom: g.yearFrom,
          yearTo: g.yearTo,
          imageUrl: photos.get(g.code) ?? g.imageUrl,
          sortOrder: i,
        })),
      });
      synced++;
      gensWritten += realGens.length;
    }
  }

  const withReal = await prisma.carModel.count({
    where: { generations: { some: { code: { not: "ALL" } } } },
  });
  const allOnly = await prisma.carModel.count({
    where: { generations: { every: { code: "ALL" } } },
  });

  // Сколько ALL-only ещё можно починить
  let stillFixable = 0;
  for (const m of dbModels) {
    if (!(m.generations.length === 1 && m.generations[0]?.code === "ALL")) continue;
    const cat = catMap.get(`${m.brand.slug}|${normKey(m.slug, m.name)}`);
    if (cat?.generations.some((g) => g.code !== "ALL")) stillFixable++;
  }

  console.log(`✓ Полная синхронизация: ${synced} моделей, ${gensWritten} поколений`);
  console.log(`  С поколениями: ${withReal}`);
  console.log(`  Только ALL: ${allOnly}`);
  console.log(`  Ещё можно исправить: ${stillFixable}`);
  console.log(`  auto-parts-db марок: ${getBrands().length}`);
}

main().finally(() => prisma.$disconnect());
