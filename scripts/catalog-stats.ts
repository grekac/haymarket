import { prisma } from "../src/lib/prisma";
import { buildCarCatalogFromPackage, getCatalogStats } from "../src/lib/car-catalog-builder";
import { getBrands, getBrand } from "auto-parts-db";

function normKey(slug: string, name?: string) {
  return (name ?? slug).toLowerCase().trim().replace(/-class$/i, "").replace(/[^a-z0-9]/g, "");
}

async function main() {
  const catalog = buildCarCatalogFromPackage();
  const stats = getCatalogStats(catalog);
  console.log("Каталог:", stats);

  const audi = await prisma.carModel.findMany({
    where: { brand: { slug: "audi" }, name: { contains: "A4", mode: "insensitive" } },
    take: 10,
    include: { generations: true },
  });
  console.log("\nAudi A4 в БД:");
  for (const m of audi) {
    console.log(`  ${m.name} (${m.slug}): ${m.generations.map((g) => g.code).join(", ")}`);
  }

  const ap = getBrand("Audi");
  const a4src = ap?.models.find((m) => m.name === "A4");
  console.log("\nauto-parts A4:", a4src?.generations);

  let fixable = 0;
  const dbModels = await prisma.carModel.findMany({
    include: { brand: true, generations: true },
  });
  const catMap = new Map<string, (typeof catalog)[0]["models"][0]>();
  for (const b of catalog) {
    for (const m of b.models) {
      catMap.set(`${b.slug}|${normKey(m.slug, m.name)}`, m);
    }
  }

  const fixableList: string[] = [];
  for (const m of dbModels) {
    const onlyAll = m.generations.length === 1 && m.generations[0]?.code === "ALL";
    if (!onlyAll) continue;
    const cat = catMap.get(`${m.brand.slug}|${normKey(m.slug, m.name)}`);
    if (cat && cat.generations.some((g) => g.code !== "ALL")) {
      fixable++;
      if (fixableList.length < 20) fixableList.push(`${m.brand.slug}/${m.slug}`);
    }
  }
  console.log(`\nМожно исправить (ALL → реальные поколения): ${fixable}`);
  fixableList.forEach((x) => console.log(" ", x));

  console.log(`\nauto-parts-db марок: ${getBrands().length}`);
}

main().finally(() => prisma.$disconnect());
