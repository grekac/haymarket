import { prisma } from "../src/lib/prisma";
import { buildCarCatalogFromPackage } from "../src/lib/car-catalog-builder";

function normKey(slug: string, name?: string) {
  return (name ?? slug).toLowerCase().trim().replace(/-class$/i, "").replace(/[^a-z0-9]/g, "");
}

async function main() {
  const catalog = buildCarCatalogFromPackage();
  const dbModels = await prisma.carModel.findMany({
    select: { id: true, slug: true, name: true, brand: { select: { slug: true } } },
  });

  const byNorm = new Map<string, typeof dbModels>();
  for (const m of dbModels) {
    const k = `${m.brand.slug}|${normKey(m.slug, m.name)}`;
    const list = byNorm.get(k) ?? [];
    list.push(m);
    byNorm.set(k, list);
  }

  let synced = 0;
  let genTotal = 0;
  let skipped = 0;

  for (const brand of catalog) {
    for (const model of brand.models) {
      const realGens = model.generations.filter((g) => g.code !== "ALL");
      if (realGens.length === 0) continue;

      const targets = byNorm.get(`${brand.slug}|${normKey(model.slug, model.name)}`) ?? [];
      if (targets.length === 0) {
        skipped++;
        continue;
      }

      for (const db of targets) {
        const old = await prisma.carGeneration.findMany({
          where: { modelId: db.id },
          select: { code: true, imageUrl: true },
        });
        const oldCodes = old.map((g) => g.code).sort().join("|");
        const newCodes = realGens.map((g) => g.code).sort().join("|");
        if (oldCodes === newCodes) continue;

        const photos = new Map(
          old.filter((g) => g.imageUrl && g.imageUrl !== "__pending__").map((g) => [g.code, g.imageUrl])
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
        genTotal += realGens.length;
      }
    }
  }

  const after = await prisma.carGeneration.groupBy({
    by: ["code"],
    where: { code: { not: "ALL" } },
    _count: true,
  });

  const modelsWithReal = await prisma.carModel.count({
    where: { generations: { some: { code: { not: "ALL" } } } },
  });
  const allOnly = await prisma.carModel.count({
    where: { generations: { every: { code: "ALL" } } },
  });

  console.log(`✓ Синхронизировано моделей: ${synced}`);
  console.log(`  Поколений записано: ${genTotal}`);
  console.log(`  Не найдено в БД: ${skipped} (каталог)`);
  console.log(`\nПосле синхронизации:`);
  console.log(`  Моделей с поколениями: ${modelsWithReal}`);
  console.log(`  Моделей только ALL: ${allOnly}`);
}

main().finally(() => prisma.$disconnect());
