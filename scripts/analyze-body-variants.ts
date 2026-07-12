import { prisma } from "../src/lib/prisma";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";
import { isRealCarPhoto } from "../src/lib/car-images";

async function main() {
  const models = await prisma.carModel.findMany({
    include: { brand: true, generations: { orderBy: { sortOrder: "asc" } } },
    where: { generations: { some: {} } },
  });

  let multiGroup = 0;
  let totalGrouped = 0;
  const examples: string[] = [];

  for (const model of models) {
    const raw = model.generations.map((g) => ({ ...g, modelId: model.id }));
    const grouped = groupGenerationsForDisplay(raw, model.brand.slug);
    const reduced = raw.length - grouped.length;
    if (reduced > 0) {
      multiGroup++;
      totalGrouped += reduced;
      if (examples.length < 15) {
        const multi = grouped.filter((g) => g.variants.length > 1);
        if (multi.length) {
          examples.push(
            `${model.brand.slug}/${model.slug}: ${raw.length}→${grouped.length} ` +
              multi.map((g) => `${g.code}[${g.variants.map((v) => v.code).join(",")}]`).join(" ")
          );
        }
      }
    }
  }

  const withPhoto = await prisma.carGeneration.count({
    where: { imageUrl: { not: { contains: "__pending__" } } },
  });
  const total = await prisma.carGeneration.count();

  console.log(`Models with grouping: ${multiGroup}`);
  console.log(`Generations collapsed: ${totalGrouped}`);
  console.log(`Photos: ${withPhoto}/${total}`);
  console.log("\nExamples:");
  examples.forEach((e) => console.log(" ", e));
}

main().finally(() => prisma.$disconnect());
