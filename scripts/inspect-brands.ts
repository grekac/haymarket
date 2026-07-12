import { prisma } from "../src/lib/prisma";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";

async function show(brand: string, slug: string) {
  const m = await prisma.carModel.findFirst({
    where: { slug, brand: { slug: brand } },
    include: { brand: true, generations: { orderBy: { sortOrder: "asc" } } },
  });
  if (!m) return;
  const raw = m.generations.map((g) => ({ ...g, modelId: m.id }));
  const grouped = groupGenerationsForDisplay(raw, brand);
  console.log(`\n${m.brand.name} ${m.name}: ${raw.length} → ${grouped.length}`);
  for (const g of m.generations) {
    console.log(`  RAW: ${g.code} | ${g.yearFrom}-${g.yearTo ?? "now"}`);
  }
  for (const g of grouped) {
    console.log(`  GRP: ${g.code} [${g.variants.map((v) => v.code).join(", ")}]`);
  }
}

async function main() {
  await show("honda", "accord");
  await show("mercedes-benz", "c-class");
  await show("mercedes-benz", "e-class");
  await show("toyota", "camry");
  await show("volkswagen", "golf");
  await show("subaru", "impreza");
  await show("audi", "a4");
}

main().finally(() => prisma.$disconnect());
