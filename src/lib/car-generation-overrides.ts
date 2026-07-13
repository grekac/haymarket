import { PLACEHOLDER_IMAGE, brandToSlug, normalizeModelMatchKey } from "./car-catalog-utils";
import { POPULAR_GENERATION_OVERRIDES } from "./car-generation-overrides-popular";
import { BMW_GENERATION_OVERRIDES } from "./car-generation-overrides-bmw";

export type SeedGeneration = {
  code: string;
  name: string;
  yearFrom: number;
  yearTo: number | null;
  imageUrl: string;
};

export type OverrideDef = {
  brand: string;
  brandSlug?: string;
  modelName: string;
  modelKeys: string[];
  modelSlugs?: string[];
  generations: { code: string; yearFrom: number; yearTo: number | null; label: string }[];
};

/** Поколения как на Авито: короткая подпись + точные годы */
export const ALL_GENERATION_OVERRIDES: OverrideDef[] = [
  ...BMW_GENERATION_OVERRIDES,
  ...POPULAR_GENERATION_OVERRIDES.filter(
    (o) => o.brand !== "BMW" || !BMW_GENERATION_OVERRIDES.some((b) => b.modelName === o.modelName)
  ),
  {
    brand: "Mercedes-Benz",
    brandSlug: "mercedes-benz",
    modelName: "CLS",
    modelKeys: ["cls"],
    modelSlugs: ["cls"],
    generations: [
      { code: "C219", yearFrom: 2004, yearTo: 2008, label: "C219" },
      { code: "C219 FL", yearFrom: 2008, yearTo: 2010, label: "C219 рестайлинг" },
      { code: "C218", yearFrom: 2010, yearTo: 2014, label: "C218" },
      { code: "C218 FL", yearFrom: 2014, yearTo: 2018, label: "C218 рестайлинг" },
      { code: "C257", yearFrom: 2018, yearTo: 2021, label: "C257" },
      { code: "C257 FL", yearFrom: 2021, yearTo: null, label: "C257 рестайлинг" },
    ],
  },
  {
    brand: "Mercedes-Benz",
    brandSlug: "mercedes-benz",
    modelName: "G-Class",
    modelKeys: ["gclass", "g"],
    modelSlugs: ["g-class", "g"],
    generations: [
      { code: "W465 FL", yearFrom: 2024, yearTo: null, label: "W465 рестайлинг" },
      { code: "W463 II", yearFrom: 2018, yearTo: 2025, label: "W463 II" },
      { code: "W463 FL4", yearFrom: 2015, yearTo: 2018, label: "W463 рестайлинг 4" },
      { code: "W463 FL3", yearFrom: 2012, yearTo: 2015, label: "W463 рестайлинг 3" },
      { code: "W463 FL2", yearFrom: 2008, yearTo: 2012, label: "W463 рестайлинг 2" },
      { code: "W463 FL1", yearFrom: 2006, yearTo: 2008, label: "W463 рестайлинг" },
      { code: "W463", yearFrom: 1990, yearTo: 2006, label: "W463" },
      { code: "W460/W461", yearFrom: 1979, yearTo: 2009, label: "W460/W461" },
    ],
  },
];

function normalizeBrandKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toSeedGenerations(
  gens: OverrideDef["generations"]
): SeedGeneration[] {
  return gens.map((g) => ({
    code: g.code,
    name: g.label,
    yearFrom: g.yearFrom,
    yearTo: g.yearTo,
    imageUrl: PLACEHOLDER_IMAGE,
  }));
}

function brandMatches(item: OverrideDef, brandSlug: string): boolean {
  const slug = brandSlug.toLowerCase();
  if (item.brandSlug === slug) return true;
  if (brandToSlug(item.brand) === slug) return true;
  return normalizeBrandKey(item.brand) === normalizeBrandKey(slug);
}

function modelMatches(item: OverrideDef, modelSlug: string, modelName?: string): boolean {
  const slug = modelSlug.toLowerCase();
  if (item.modelSlugs?.includes(slug)) return true;

  const normSlug = normalizeModelMatchKey(slug);
  if (item.modelKeys.includes(normSlug)) return true;

  if (modelName) {
    const normName = normalizeModelMatchKey(modelName);
    if (item.modelKeys.includes(normName)) return true;
  }

  return false;
}

/** Найти точные поколения по slug марки/модели (приоритет над сырым каталогом) */
export function lookupGenerationOverride(
  brandSlug: string,
  modelSlug: string,
  modelName?: string
): SeedGeneration[] | null {
  for (const item of ALL_GENERATION_OVERRIDES) {
    if (!brandMatches(item, brandSlug)) continue;
    if (!modelMatches(item, modelSlug, modelName)) continue;
    return toSeedGenerations(item.generations);
  }
  return null;
}

export function buildGenerationOverridesIndex(): Map<string, SeedGeneration[]> {
  const index = new Map<string, SeedGeneration[]>();

  for (const item of ALL_GENERATION_OVERRIDES) {
    const brandKey = normalizeBrandKey(item.brandSlug ?? brandToSlug(item.brand));
    const keys = new Set<string>(item.modelKeys);
    for (const slug of item.modelSlugs ?? []) {
      keys.add(normalizeModelMatchKey(slug));
    }
    const gens = toSeedGenerations(item.generations);
    for (const modelKey of keys) {
      index.set(`${brandKey}|${modelKey}`, gens);
    }
  }

  return index;
}

export function modelMatchKeyFromNames(brandName: string, modelName: string) {
  return `${normalizeBrandKey(brandName)}|${normalizeModelMatchKey(modelName)}`;
}
