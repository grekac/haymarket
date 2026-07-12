import { prisma } from "../src/lib/prisma";

async function main() {
  for (const slug of ["3-er-reihe", "5-series", "c-class"]) {
    const model = await prisma.carModel.findFirst({
      where: { slug, brand: { slug: slug === "c-class" ? "mercedes-benz" : "bmw" } },
      include: { brand: true, generations: { orderBy: { sortOrder: "asc" } } },
    });
    if (!model) continue;
    console.log(`\n${model.brand.name} ${model.name}:`);
    for (const g of model.generations) {
      console.log(`  ${g.code.padEnd(8)} ${g.yearFrom}-${g.yearTo ?? "now"}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
