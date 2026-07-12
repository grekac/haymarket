/**
 * Copy best photo within each generation group to all body variants.
 * Run: npm run db:sync-group-photos
 */
import { PrismaClient } from "@prisma/client";
import { groupGenerationsForDisplay, type RawGeneration } from "../src/lib/car-generation-groups";
import { isRealCarPhoto } from "../src/lib/car-images";

const prisma = new PrismaClient();

async function main() {
  const models = await prisma.carModel.findMany({
    include: {
      brand: { select: { slug: true } },
      generations: true,
    },
  });

  let updated = 0;

  for (const model of models) {
    const raw: RawGeneration[] = model.generations.map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
      yearFrom: g.yearFrom,
      yearTo: g.yearTo,
      imageUrl: g.imageUrl,
      modelId: g.modelId,
    }));

    const grouped = groupGenerationsForDisplay(raw, model.brand.slug);

    for (const group of grouped) {
      const best = group.imageUrl;
      if (!isRealCarPhoto(best)) continue;

      for (const variant of group.variants) {
        const gen = model.generations.find((g) => g.id === variant.id);
        if (!gen || gen.imageUrl === best) continue;
        if (!isRealCarPhoto(gen.imageUrl)) {
          await prisma.carGeneration.update({
            where: { id: gen.id },
            data: { imageUrl: best },
          });
          updated++;
        }
      }
    }
  }

  console.log(`✓ Synced ${updated} body-variant photos from group leaders`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
