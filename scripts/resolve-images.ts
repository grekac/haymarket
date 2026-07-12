/**
 * Batch-resolve generation images from Wikipedia and cache in DB.
 * Run: npm run db:resolve-images
 * Popular brands only: npm run db:resolve-images -- --popular --limit 3000
 * Re-resolve logo fallbacks: npm run db:resolve-images -- --all --limit 5000
 */
import { PrismaClient } from "@prisma/client";
import { resolveGenerationImage, isPlaceholderImage, isRealCarPhoto } from "../src/lib/car-images";
import { POPULAR_BRAND_SLUGS } from "../src/lib/car-logos";

const prisma = new PrismaClient();
const CONCURRENCY = 4;

async function resolveOne(gen: {
  id: string;
  code: string;
  imageUrl: string;
  model: {
    name: string;
    slug: string;
    brand: { name: string; slug: string; logoUrl: string };
  };
}) {
  if (!isPlaceholderImage(gen.imageUrl)) {
    return "cached";
  }

  const url = await resolveGenerationImage(
    gen.model.brand.name,
    gen.model.name,
    gen.code,
    gen.model.brand.logoUrl,
    gen.model.brand.slug,
    gen.model.slug
  );

  if (isRealCarPhoto(url)) {
    try {
      await prisma.carGeneration.update({
        where: { id: gen.id },
        data: { imageUrl: url },
      });
      return "ok";
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
        return "stale";
      }
      throw e;
    }
  }

  return "skip";
}

async function runPool<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function next(): Promise<void> {
    const i = index++;
    if (i >= items.length) return;
    results[i] = await worker(items[i]);
    await next();
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => next()));
  return results;
}

async function main() {
  const limitIdx = process.argv.indexOf("--limit");
  const all = process.argv.includes("--all");
  const popular = process.argv.includes("--popular");
  const limit = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) || 10000 : 10000;

  const flags = [all && "all", popular && "popular"].filter(Boolean).join(", ");
  console.log(`🖼 Resolving up to ${limit} generation images${flags ? ` (${flags})` : ""}...`);

  const pending = await prisma.carGeneration.findMany({
    where: {
      ...(all
        ? {
            OR: [
              { imageUrl: "__pending__" },
              { imageUrl: { contains: "car-logos-dataset" } },
            ],
          }
        : { imageUrl: "__pending__" }),
      ...(popular
        ? { model: { brand: { slug: { in: POPULAR_BRAND_SLUGS } } } }
        : {}),
    },
    take: limit,
    include: {
      model: {
        include: {
          brand: { select: { name: true, slug: true, logoUrl: true } },
        },
      },
    },
    orderBy: [{ model: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  console.log(`   Found ${pending.length} to resolve`);

  let resolved = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    const outcomes = await runPool(batch, resolveOne, CONCURRENCY);
    for (const o of outcomes) {
      if (o === "ok") resolved++;
      else if (o === "skip") failed++;
    }

    const done = Math.min(i + CONCURRENCY, pending.length);
    if (done % 50 < CONCURRENCY || done === pending.length) {
      console.log(`   ... ${done}/${pending.length} (${resolved} saved)`);
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`✓ Done: ${resolved} real photos saved, ${failed} without photo`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
