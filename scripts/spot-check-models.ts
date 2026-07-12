import { prisma } from "../src/lib/prisma";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";

const CHECKS: [string, string][] = [
  ["bmw", "3-er-reihe"],
  ["bmw", "5-series"],
  ["mercedes-benz", "c-class"],
  ["mercedes-benz", "e-class"],
  ["mercedes-benz", "cls-class"],
  ["mercedes-benz", "cls"],
  ["audi", "a4"],
  ["audi", "a6"],
  ["volkswagen", "golf"],
  ["toyota", "camry"],
  ["toyota", "corolla"],
  ["honda", "accord"],
  ["honda", "civic"],
  ["nissan", "qashqai"],
  ["nissan", "x-trail"],
  ["hyundai", "tucson"],
  ["kia", "sportage"],
  ["lexus", "rx"],
];

async function main() {
  console.log("=== Проверка популярных моделей ===\n");
  for (const [brand, slug] of CHECKS) {
    const m = await prisma.carModel.findFirst({
      where: { slug, brand: { slug: brand } },
      include: { generations: { orderBy: { sortOrder: "asc" } } },
    });
    if (!m) {
      console.log(`— ${brand}/${slug}: нет в БД`);
      continue;
    }
    const raw = m.generations.map((g) => ({ ...g, modelId: m.id }));
    const grouped = groupGenerationsForDisplay(raw, brand);
    console.log(`${m.name} (${brand}): ${raw.length} → ${grouped.length} карточек`);
    for (const g of grouped) {
      const vars = g.variants.length > 1 ? ` [${g.variants.map((v) => v.code).join(",")}]` : "";
      console.log(`  ${g.code} ${g.yearFrom}-${g.yearTo ?? "now"}${vars}`);
    }
    console.log();
  }
}

main().finally(() => prisma.$disconnect());
