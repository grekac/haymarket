/**
 * Сброс неправильных фото (чужие машины, логотипы, model fallback).
 * Run: npm run db:reset-photos
 */
import { PrismaClient } from "@prisma/client";
import { lookupGenerationImage } from "../src/lib/car-generation-images";
import { isRealCarPhoto } from "../src/lib/car-images";

const prisma = new PrismaClient();

async function main() {
  const gens = await prisma.carGeneration.findMany({
    include: { model: { include: { brand: { select: { slug: true } } } } },
  });

  const urlModels = new Map<string, Set<string>>();
  for (const g of gens) {
    if (!isRealCarPhoto(g.imageUrl)) continue;
    const key = `${g.model.brand.slug}|${g.model.slug}`;
    const set = urlModels.get(g.imageUrl) ?? new Set();
    set.add(key);
    urlModels.set(g.imageUrl, set);
  }

  let reset = 0;
  for (const g of gens) {
    if (!isRealCarPhoto(g.imageUrl)) continue;

    const curated = lookupGenerationImage(g.model.brand.slug, g.model.slug, g.code);
    if (curated && g.imageUrl === curated) continue;

    const brandCurated = lookupGenerationImage(g.model.brand.slug, g.model.slug, g.code);
    const usedBy = urlModels.get(g.imageUrl)?.size ?? 1;

    if (
      g.code === "ALL" ||
      g.imageUrl.includes("car-logos-dataset") ||
      usedBy >= 20
    ) {
      await prisma.carGeneration.update({
        where: { id: g.id },
        data: { imageUrl: "__pending__" },
      });
      reset++;
    }
  }

  console.log(`✓ Reset ${reset} wrong photos to pending`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
