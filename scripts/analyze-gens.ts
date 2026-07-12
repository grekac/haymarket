import { prisma } from "../src/lib/prisma";

async function main() {
  const slashGens = await prisma.carGeneration.findMany({
    where: { code: { contains: "/" } },
    include: { model: { include: { brand: true } } },
    take: 30,
  });
  console.log("Compound codes:", slashGens.length);
  slashGens.slice(0, 15).forEach((g) =>
    console.log(g.model.brand.slug, g.model.slug, g.code, g.yearFrom, g.yearTo)
  );

  const bmw5 = await prisma.carModel.findFirst({
    where: { brand: { slug: "bmw" }, slug: "5-series" },
    include: { generations: { orderBy: { sortOrder: "asc" } } },
  });
  console.log("\nBMW 5 Series:");
  bmw5?.generations.forEach((g) => console.log(g.code, g.yearFrom, g.yearTo));

  const mini = await prisma.carModel.findFirst({
    where: { brand: { slug: "mini" } },
    include: { generations: { orderBy: { sortOrder: "asc" }, take: 15 } },
  });
  console.log("\nMINI sample:", mini?.name);
  mini?.generations.forEach((g) => console.log(g.code, g.yearFrom));

  const noPhoto = await prisma.carGeneration.count({
    where: {
      OR: [
        { imageUrl: "__pending__" },
        { imageUrl: { contains: "car-logos-dataset" } },
      ],
    },
  });
  const total = await prisma.carGeneration.count();
  console.log(`\nNo photo: ${noPhoto}/${total}`);
}

main().finally(() => prisma.$disconnect());
