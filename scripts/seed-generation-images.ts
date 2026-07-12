/**
 * Apply curated generation photos to database.
 * Run: npm run db:seed-gen-images
 */
import { PrismaClient } from "@prisma/client";
import { lookupGenerationImage } from "../src/lib/car-generation-images";
import { isRealCarPhoto } from "../src/lib/car-images";

const prisma = new PrismaClient();

async function main() {
  const gens = await prisma.carGeneration.findMany({
    include: {
      model: { include: { brand: { select: { slug: true } } } },
    },
  });

  let updated = 0;
  for (const gen of gens) {
    const url = lookupGenerationImage(
      gen.model.brand.slug,
      gen.model.slug,
      gen.code
    );
    if (!isRealCarPhoto(url)) continue;
    if (gen.imageUrl === url) continue;

    await prisma.carGeneration.update({
      where: { id: gen.id },
      data: { imageUrl: url },
    });
    updated++;
  }

  console.log(`✓ Applied ${updated} curated generation photos`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
