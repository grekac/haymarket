/**
 * Apply photos scoped to brand+model — no global code sharing.
 * Run: npm run db:apply-all-photos
 */
import { PrismaClient } from "@prisma/client";
import { lookupGenerationImage } from "../src/lib/car-generation-images";
import { groupGenerationsForDisplay, type RawGeneration } from "../src/lib/car-generation-groups";
import { isRealCarPhoto } from "../src/lib/car-images";

const prisma = new PrismaClient();

async function main() {
  const gens = await prisma.carGeneration.findMany({
    include: {
      model: { include: { brand: { select: { slug: true, name: true } } } },
    },
  });

  let updated = 0;

  // 1. Curated cache (brand|model|code)
  for (const gen of gens) {
    const url = lookupGenerationImage(gen.model.brand.slug, gen.model.slug, gen.code);
    if (!isRealCarPhoto(url) || gen.imageUrl === url) continue;
    if (isRealCarPhoto(gen.imageUrl)) continue;
    await prisma.carGeneration.update({ where: { id: gen.id }, data: { imageUrl: url } });
    gen.imageUrl = url;
    updated++;
  }
  console.log(`   Curated cache: ${updated}`);

  // 2. Brand+code map (только внутри марки)
  const brandCodePhoto = new Map<string, string>();
  for (const gen of gens) {
    if (!isRealCarPhoto(gen.imageUrl)) continue;
    const code = gen.code.split("/")[0].trim().toUpperCase();
    const key = `${gen.model.brand.slug}|${code}`;
    if (!brandCodePhoto.has(key)) brandCodePhoto.set(key, gen.imageUrl);
  }

  let codeUpdated = 0;
  for (const gen of gens) {
    if (isRealCarPhoto(gen.imageUrl)) continue;
    const code = gen.code.split("/")[0].trim().toUpperCase();
    const url = brandCodePhoto.get(`${gen.model.brand.slug}|${code}`);
    if (!isRealCarPhoto(url)) continue;
    await prisma.carGeneration.update({ where: { id: gen.id }, data: { imageUrl: url! } });
    gen.imageUrl = url!;
    codeUpdated++;
  }
  console.log(`   Brand+code map: ${codeUpdated}`);
  updated += codeUpdated;

  // 3. Group leaders (body variants within model)
  const models = new Map<string, typeof gens>();
  for (const gen of gens) {
    const list = models.get(gen.modelId) ?? [];
    list.push(gen);
    models.set(gen.modelId, list);
  }

  let groupUpdated = 0;
  for (const [, modelGens] of models) {
    const brandSlug = modelGens[0].model.brand.slug;
    const raw: RawGeneration[] = modelGens.map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
      yearFrom: g.yearFrom,
      yearTo: g.yearTo,
      imageUrl: g.imageUrl,
      modelId: g.modelId,
    }));
    const grouped = groupGenerationsForDisplay(raw, brandSlug);
    for (const group of grouped) {
      if (!isRealCarPhoto(group.imageUrl)) continue;
      for (const v of group.variants) {
        const gen = modelGens.find((g) => g.id === v.id);
        if (!gen || isRealCarPhoto(gen.imageUrl) || gen.imageUrl === group.imageUrl) continue;
        await prisma.carGeneration.update({
          where: { id: gen.id },
          data: { imageUrl: group.imageUrl },
        });
        gen.imageUrl = group.imageUrl;
        groupUpdated++;
      }
    }
  }
  console.log(`   Group sync: ${groupUpdated}`);
  updated += groupUpdated;

  const remaining = gens.filter((g) => !isRealCarPhoto(g.imageUrl)).length;
  console.log(`✓ Total updated: ${updated}, still without photo: ${remaining}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
