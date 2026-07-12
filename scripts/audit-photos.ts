import { prisma } from "../src/lib/prisma";
import { lookupGenerationImage } from "../src/lib/car-generation-images";

async function main() {
  const samples = [
    { brand: "bmw", model: "3-er-reihe", code: "E90" },
    { brand: "bmw", model: "3-er-reihe", code: "E30" },
    { brand: "mercedes-benz", model: "c-class", code: "W204" },
    { brand: "volkswagen", model: "golf", code: "TYPE 5G" },
    { brand: "honda", model: "accord", code: "CB" },
  ];

  for (const s of samples) {
    const gen = await prisma.carGeneration.findFirst({
      where: { code: s.code, model: { slug: s.model, brand: { slug: s.brand } } },
      select: { imageUrl: true, yearFrom: true, yearTo: true },
    });
    const cached = lookupGenerationImage(s.brand, s.model, s.code);
    console.log(`${s.brand} ${s.model} ${s.code}:`);
    console.log(`  DB: ${gen?.imageUrl?.slice(0, 80) ?? "none"}`);
    console.log(`  Cache: ${cached?.slice(0, 80) ?? "none"}`);
    console.log(`  Years: ${gen?.yearFrom}-${gen?.yearTo}`);
  }

  // Find cross-brand photo duplicates
  const gens = await prisma.carGeneration.findMany({
    where: { imageUrl: { contains: "wikimedia" } },
    take: 5000,
    include: { model: { include: { brand: true } } },
  });

  const byUrl = new Map<string, string[]>();
  for (const g of gens) {
    const list = byUrl.get(g.imageUrl) ?? [];
    list.push(`${g.model.brand.slug}/${g.model.slug}/${g.code}`);
    byUrl.set(g.imageUrl, list);
  }

  let suspicious = 0;
  for (const [url, models] of byUrl) {
    if (models.length < 2) continue;
    const brands = new Set(models.map((m) => m.split("/")[0]));
    if (brands.size > 1) {
      suspicious++;
      if (suspicious <= 5) {
        console.log(`\nCross-brand photo (${models.length}):`);
        console.log(`  ${url.slice(0, 90)}`);
        models.slice(0, 6).forEach((m) => console.log(`    ${m}`));
      }
    }
  }
  console.log(`\nCross-brand duplicate photos: ${suspicious}`);
}

main().finally(() => prisma.$disconnect());
