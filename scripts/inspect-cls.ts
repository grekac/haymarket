import { prisma } from "../src/lib/prisma";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";
import { buildCarCatalogFromPackage } from "../src/lib/car-catalog-builder";
import { getBrand } from "auto-parts-db";

async function main() {
  const models = await prisma.carModel.findMany({
    where: { slug: { contains: "cls" }, brand: { slug: "mercedes-benz" } },
    include: { brand: true, generations: { orderBy: { sortOrder: "asc" } } },
  });

  console.log("=== DB models matching cls ===");
  for (const m of models) {
    const raw = m.generations.map((g) => ({ ...g, modelId: m.id }));
    const grouped = groupGenerationsForDisplay(raw, m.brand.slug);
    console.log(`\n${m.name} (${m.slug}): ${raw.length} raw → ${grouped.length} UI`);
    for (const g of m.generations) {
      console.log(`  RAW: ${g.code} | ${g.yearFrom}-${g.yearTo ?? "now"}`);
    }
    for (const g of grouped) {
      console.log(`  UI:  ${g.code} | ${g.yearFrom}-${g.yearTo ?? "now"} [${g.variants.map((v) => v.code).join(",")}]`);
    }
  }

  const catalog = buildCarCatalogFromPackage();
  const mb = catalog.find((b) => b.slug === "mercedes-benz");
  const catCls = mb?.models.filter((m) => /cls/i.test(m.name) || /cls/i.test(m.slug));
  console.log("\n=== Catalog CLS models ===");
  catCls?.forEach((m) => {
    console.log(`\n${m.name} (${m.slug}):`);
    m.generations.forEach((g) => console.log(`  ${g.code} ${g.yearFrom}-${g.yearTo}`));
  });

  const brand = getBrand("Mercedes-Benz");
  const src = brand?.models.filter((m) => /cls/i.test(m.name));
  console.log("\n=== auto-parts-db source ===");
  src?.forEach((m) => {
    console.log(`\n${m.name}:`);
    m.generations.forEach((g) => console.log(`  "${g.name}" ${g.yearFrom}-${g.yearTo}`));
  });
}

main().finally(() => prisma.$disconnect());
