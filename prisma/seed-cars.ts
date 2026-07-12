import { PrismaClient } from "@prisma/client";
import { buildCarCatalogFromPackage, getCatalogStats } from "../src/lib/car-catalog-builder";

const BATCH = 500;

export async function seedCarCatalog(prisma: PrismaClient) {
  console.log("🚗 Building mega catalog (cars + vans + trucks + motorcycles + mopeds + buses)...");

  await prisma.carGeneration.deleteMany();
  await prisma.carModel.deleteMany();
  await prisma.carBrand.deleteMany();

  const catalog = buildCarCatalogFromPackage();
  const stats = getCatalogStats(catalog);
  console.log(`   📦 ${stats.brands} brands, ${stats.models} models, ${stats.generations} generations`);

  // Bulk insert brands
  await prisma.carBrand.createMany({
    data: catalog.map((b) => ({
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      sortOrder: b.sortOrder,
    })),
  });

  const brandRows = await prisma.carBrand.findMany({ select: { id: true, slug: true } });
  const brandIdBySlug = new Map(brandRows.map((b) => [b.slug, b.id]));

  // Prepare all models
  const modelRows: { brandId: string; name: string; slug: string; sortOrder: number; _brandSlug: string; _gens: typeof catalog[0]["models"][0]["generations"] }[] = [];

  for (const brand of catalog) {
    const brandId = brandIdBySlug.get(brand.slug);
    if (!brandId) continue;
    brand.models.forEach((model, mi) => {
      modelRows.push({
        brandId,
        name: model.name,
        slug: model.slug,
        sortOrder: mi,
        _brandSlug: brand.slug,
        _gens: model.generations,
      });
    });
  }

  // Insert models in batches
  for (let i = 0; i < modelRows.length; i += BATCH) {
    const batch = modelRows.slice(i, i + BATCH);
    await prisma.carModel.createMany({
      data: batch.map(({ brandId, name, slug, sortOrder }) => ({ brandId, name, slug, sortOrder })),
    });
  }

  // Fetch all models for generation insert
  const allModels = await prisma.carModel.findMany({
    select: { id: true, brandId: true, slug: true },
  });

  const modelIdMap = new Map(allModels.map((m) => [`${m.brandId}|${m.slug}`, m.id]));

  const genRows: { modelId: string; code: string; name: string | null; yearFrom: number; yearTo: number | null; imageUrl: string; sortOrder: number }[] = [];

  for (const brand of catalog) {
    const brandId = brandIdBySlug.get(brand.slug);
    if (!brandId) continue;
    for (const model of brand.models) {
      const modelId = modelIdMap.get(`${brandId}|${model.slug}`);
      if (!modelId) continue;
      model.generations.forEach((gen, gi) => {
        genRows.push({
          modelId,
          code: gen.code,
          name: gen.name,
          yearFrom: gen.yearFrom,
          yearTo: gen.yearTo,
          imageUrl: gen.imageUrl,
          sortOrder: gi,
        });
      });
    }
  }

  for (let i = 0; i < genRows.length; i += BATCH) {
    await prisma.carGeneration.createMany({ data: genRows.slice(i, i + BATCH) });
  }

  console.log(`   ✓ Seeded ${stats.brands} brands, ${stats.models} models, ${stats.generations} generations`);
}
