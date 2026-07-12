import { prisma } from "../src/lib/prisma";
import { buildCarCatalogFromPackage } from "../src/lib/car-catalog-builder";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";
import { getBrand } from "auto-parts-db";

async function main() {
  const models = await prisma.carModel.findMany({
    where: {
      brand: { slug: "mercedes-benz" },
      OR: [
        { slug: { contains: "g-class" } },
        { slug: { contains: "g-klasse" } },
        { slug: { contains: "g-class" } },
        { name: { contains: "G-Class" } },
        { name: { contains: "G-Klasse" } },
        { slug: "g" },
        { name: "G" },
        { name: { contains: "G Class" } },
      ],
    },
    include: { brand: true, generations: { orderBy: { sortOrder: "asc" } } },
  });

  console.log("=== DB G-Class models ===");
  for (const m of models) {
    const raw = m.generations.map((g) => ({ ...g, modelId: m.id }));
    const grouped = groupGenerationsForDisplay(raw, m.brand.slug, m.slug);
    console.log(`\n${m.name} (${m.slug}): ${raw.length} → ${grouped.length}`);
    for (const g of m.generations) {
      console.log(`  RAW: ${g.code} | ${g.yearFrom}-${g.yearTo ?? "now"} | ${g.name}`);
    }
    for (const g of grouped) {
      console.log(`  UI:  ${g.code} | ${g.yearFrom}-${g.yearTo ?? "now"} [${g.variants.map((v) => v.code).join(",")}]`);
    }
  }

  const catalog = buildCarCatalogFromPackage();
  const mb = catalog.find((b) => b.slug === "mercedes-benz");
  const catG = mb?.models.filter((m) => /g-class|g-klasse|^g$/i.test(m.slug) || /g-class|g-klasse/i.test(m.name));
  console.log("\n=== Catalog ===");
  catG?.forEach((m) => {
    console.log(`\n${m.name} (${m.slug}):`);
    m.generations.forEach((g) => console.log(`  ${g.code} ${g.yearFrom}-${g.yearTo}`));
  });

  const brand = getBrand("Mercedes-Benz");
  const src = brand?.models.filter((m) => /g-class|g-klasse|^g$/i.test(m.name));
  console.log("\n=== auto-parts-db ===");
  src?.forEach((m) => {
    console.log(`\n${m.name}:`);
    m.generations.forEach((g) => console.log(`  "${g.name}" ${g.yearFrom}-${g.yearTo}`));
  });
}

main().finally(() => prisma.$disconnect());
