import { prisma } from "../src/lib/prisma";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";

async function main() {
  const models = await prisma.carModel.findMany({
    include: { brand: true, generations: { orderBy: { sortOrder: "asc" } } },
    where: { generations: { some: {} } },
  });

  const missed: { brand: string; model: string; raw: number; grouped: number; codes: string[] }[] = [];

  for (const model of models) {
    const raw = model.generations.map((g) => ({ ...g, modelId: model.id }));
    const grouped = groupGenerationsForDisplay(raw, model.brand.slug);
    if (raw.length === grouped.length) continue;

    const multi = grouped.filter((g) => g.variants.length > 1);
    if (multi.length === 0) {
      // grouped count differs but no multi-variant groups — odd
      missed.push({
        brand: model.brand.slug,
        model: model.slug,
        raw: raw.length,
        grouped: grouped.length,
        codes: raw.map((g) => g.code),
      });
      continue;
    }
  }

  // Models with same years but NOT grouped
  const yearMissed: string[] = [];
  for (const model of models) {
    const raw = model.generations;
    const byYear = new Map<string, typeof raw>();
    for (const g of raw) {
      const yk = `${g.yearFrom}|${g.yearTo ?? "null"}`;
      const list = byYear.get(yk) ?? [];
      list.push(g);
      byYear.set(yk, list);
    }
    const grouped = groupGenerationsForDisplay(
      raw.map((g) => ({ ...g, modelId: model.id })),
      model.brand.slug
    );
    for (const [yk, bucket] of byYear) {
      if (bucket.length < 2) continue;
      const codes = bucket.map((g) => g.code);
      const allInOneGroup = grouped.some(
        (g) =>
          g.variants.length >= bucket.length &&
          bucket.every((b) => g.variants.some((v) => v.code === b.code))
      );
      if (!allInOneGroup && model.brand.slug !== "bmw") {
        yearMissed.push(
          `${model.brand.slug}/${model.slug} [${yk}]: ${codes.join(", ")} (${bucket.length} gens, ${grouped.length} cards)`
        );
      }
    }
  }

  console.log("=== Same years NOT grouped (non-BMW, top 40) ===");
  yearMissed.slice(0, 40).forEach((l) => console.log(l));
  console.log(`\nTotal year-missed: ${yearMissed.length}`);

  // Brands with zero grouping
  const byBrand = new Map<string, { total: number; grouped: number }>();
  for (const model of models) {
    const raw = model.generations.map((g) => ({ ...g, modelId: model.id }));
    const grouped = groupGenerationsForDisplay(raw, model.brand.slug);
    const stat = byBrand.get(model.brand.slug) ?? { total: 0, grouped: 0 };
    stat.total++;
    if (grouped.length < raw.length) stat.grouped++;
    byBrand.set(model.brand.slug, stat);
  }

  console.log("\n=== Brands with grouping ===");
  for (const [brand, s] of [...byBrand.entries()].sort((a, b) => b[1].grouped - a[1].grouped)) {
    if (s.grouped > 0) console.log(`${brand}: ${s.grouped}/${s.total} models`);
  }

  console.log("\n=== Brands with NO grouping at all ===");
  for (const [brand, s] of [...byBrand.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (s.grouped === 0) console.log(`${brand}: ${s.total} models`);
  }
}

main().finally(() => prisma.$disconnect());
