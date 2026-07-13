import { buildCarCatalogFromPackage } from "@/lib/car-catalog-builder";
import {
  ALLOWED_CAR_BRANDS,
  FEATURED_BRAND_SLUGS,
} from "@/lib/car-allowed-brands";
import { carLogoUrl } from "@/lib/car-catalog-utils";
import { lookupGenerationImage } from "@/lib/car-generation-images";
import { isRealCarPhoto } from "@/lib/car-images";

type MemBrand = { id: string; name: string; slug: string; logoUrl: string };
type MemModel = { id: string; name: string; slug: string; brandId: string };
type MemGeneration = {
  id: string;
  code: string;
  name: string | null;
  yearFrom: number;
  yearTo: number | null;
  imageUrl: string;
  modelId: string;
};

type MemGenerationRecord = MemGeneration & {
  brandSlug: string;
  modelSlug: string;
  brandName: string;
  modelName: string;
};

let catalogLoaded = false;
const brandById = new Map<string, MemBrand>();
const modelsByBrandId = new Map<string, MemModel[]>();
const modelById = new Map<string, MemModel & { brandSlug: string }>();
const gensByModelId = new Map<string, MemGeneration[]>();
const genById = new Map<string, MemGenerationRecord>();

export function memoryBrandIdFromSlug(slug: string) {
  return `mem-brand-${slug}`;
}

export function memoryModelIdFromSlugs(brandSlug: string, modelSlug: string) {
  return `mem-model-${brandSlug}-${modelSlug}`;
}

function brandId(slug: string) {
  return memoryBrandIdFromSlug(slug);
}

function modelId(brandSlug: string, modelSlug: string) {
  return memoryModelIdFromSlugs(brandSlug, modelSlug);
}

function generationId(brandSlug: string, modelSlug: string, code: string) {
  return `mem-gen-${brandSlug}-${modelSlug}-${code}`;
}

function generationImageUrl(
  brandSlug: string,
  modelSlug: string,
  code: string,
  fallback: string
) {
  if (isRealCarPhoto(fallback)) return fallback;
  const cached = lookupGenerationImage(brandSlug, modelSlug, code);
  return cached ?? fallback;
}

/** Всегда используем курируемый каталог (как Авито), а не сырой Prisma. */
export async function shouldUseMemoryCarCatalog(): Promise<boolean> {
  return true;
}

function ensureCatalog() {
  if (catalogLoaded) return;
  try {
    const catalog = buildCarCatalogFromPackage();

    for (const b of catalog) {
      const id = brandId(b.slug);
      const brand: MemBrand = { id, name: b.name, slug: b.slug, logoUrl: b.logoUrl };
      brandById.set(id, brand);

      const models: MemModel[] = [];
      for (const m of b.models) {
        const mid = modelId(b.slug, m.slug);
        const model: MemModel = { id: mid, name: m.name, slug: m.slug, brandId: id };
        models.push(model);
        modelById.set(mid, { ...model, brandSlug: b.slug });

        const gens: MemGeneration[] = m.generations.map((g) => ({
          id: generationId(b.slug, m.slug, g.code),
          code: g.code,
          name: g.name,
          yearFrom: g.yearFrom,
          yearTo: g.yearTo,
          imageUrl: generationImageUrl(b.slug, m.slug, g.code, g.imageUrl),
          modelId: mid,
        }));
        gensByModelId.set(mid, gens);
        for (const gen of gens) {
          genById.set(gen.id, {
            ...gen,
            brandSlug: b.slug,
            modelSlug: m.slug,
            brandName: b.name,
            modelName: m.name,
          });
        }
      }
      modelsByBrandId.set(id, models);
    }

    for (const allowed of ALLOWED_CAR_BRANDS) {
      const id = brandId(allowed.slug);
      if (!brandById.has(id)) {
        brandById.set(id, {
          id,
          name: allowed.name,
          slug: allowed.slug,
          logoUrl: carLogoUrl(allowed.slug),
        });
        modelsByBrandId.set(id, []);
      }
    }
  } catch (error) {
    console.error("[car-catalog-fallback] Failed to build catalog:", error);
  }

  catalogLoaded = true;
}

export function isMemoryCarId(id: string) {
  return id.startsWith("mem-");
}

export function getMemoryBrands(opts: {
  q?: string;
  popular?: boolean;
  limit?: number;
  all?: boolean;
}): MemBrand[] {
  ensureCatalog();
  let brands = ALLOWED_CAR_BRANDS.map((allowed) => {
    const id = brandId(allowed.slug);
    const fromCatalog = brandById.get(id);
    return {
      id,
      name: fromCatalog?.name ?? allowed.name,
      slug: allowed.slug,
      logoUrl: fromCatalog?.logoUrl ?? carLogoUrl(allowed.slug),
    };
  });

  if (opts.popular) {
    const order = new Map(FEATURED_BRAND_SLUGS.map((s, i) => [s, i]));
    brands = brands
      .filter((b) => order.has(b.slug))
      .sort((a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999));
  } else {
    brands.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (opts.q) {
    const lower = opts.q.toLowerCase();
    brands = brands.filter((b) => b.name.toLowerCase().includes(lower));
  }

  if (!opts.all && opts.limit) {
    brands = brands.slice(0, opts.limit);
  } else if (!opts.all && !opts.q && !opts.popular) {
    brands = brands.slice(0, 500);
  }

  return brands;
}

export function getMemoryModels(brandId: string, q?: string): MemModel[] {
  ensureCatalog();
  let models = modelsByBrandId.get(brandId) ?? [];
  models = [...models].sort((a, b) => a.name.localeCompare(b.name));

  if (q) {
    const lower = q.toLowerCase();
    models = models.filter((m) => m.name.toLowerCase().includes(lower));
  }

  return models;
}

export function getMemoryGenerations(modelId: string) {
  ensureCatalog();
  return gensByModelId.get(modelId) ?? [];
}

export function getMemoryModel(modelId: string) {
  ensureCatalog();
  return modelById.get(modelId) ?? null;
}

export function getMemoryGeneration(genId: string) {
  ensureCatalog();
  return genById.get(genId) ?? null;
}
