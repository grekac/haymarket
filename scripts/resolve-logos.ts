/**
 * Resolve and cache ALL brand logos in database.
 * Run: npm run db:resolve-logos
 */
import { PrismaClient } from "@prisma/client";
import { resolveBrandLogo, LOGO_INITIALS } from "../src/lib/car-logos";

const prisma = new PrismaClient();
const CONCURRENCY = 8;

function needsResolve(logoUrl: string | null) {
  return (
    !logoUrl ||
    logoUrl.includes("car-logos-dataset") ||
    logoUrl === LOGO_INITIALS
  );
}

async function resolveOne(brand: { id: string; name: string; slug: string; logoUrl: string }) {
  const url = await resolveBrandLogo(brand.name, brand.slug);
  await prisma.carBrand.update({
    where: { id: brand.id },
    data: { logoUrl: url },
  });
  return url === LOGO_INITIALS ? "initials" : "logo";
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
  const brands = await prisma.carBrand.findMany({ orderBy: { name: "asc" } });
  const pending = brands.filter((b) => needsResolve(b.logoUrl));
  console.log(`🏷 Resolving logos: ${pending.length} pending / ${brands.length} total`);

  let resolved = 0;
  let initials = 0;

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    const outcomes = await runPool(batch, resolveOne, CONCURRENCY);
    for (const o of outcomes) {
      if (o === "initials") initials++;
      else resolved++;
    }

    const done = Math.min(i + CONCURRENCY, pending.length);
    if (done % 50 < CONCURRENCY || done === pending.length) {
      console.log(`   ... ${done}/${pending.length} (${resolved} logos, ${initials} initials)`);
    }
  }

  console.log(`✓ Done: ${resolved} logos cached, ${initials} use initials fallback`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
