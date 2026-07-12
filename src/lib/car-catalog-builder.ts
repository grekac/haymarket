import fs from "fs";
import path from "path";
import { getBrands, getBrand } from "auto-parts-db";
import { getMakes, getModels } from "@meterapp/vehicle-db";
import {
  brandToSlug,
  carLogoUrl,
  parseGenerationCodes,
  PLACEHOLDER_IMAGE,
  modelToSlug,
  formatGenerationTitle,
  normalizeModelMatchKey,
} from "./car-catalog-utils";
import { buildGenerationOverridesIndex } from "./car-generation-overrides";

function isValidGenerationCode(code: string, brandSlug?: string, modelSlug?: string): boolean {
  if (!code || code === "ALL") return true;
  if (/^\d+$/.test(code)) return false;
  const bmw3 = new Set(["3-er-reihe", "series-3", "3-series", "3er"]);
  if (brandSlug === "bmw" && modelSlug && bmw3.has(modelSlug) && /^F3[236]$/.test(code)) return false;
  return true;
}

function filterGenerations(gens: SeedGeneration[], brandSlug: string, modelSlug: string) {
  return gens.filter((g) => isValidGenerationCode(g.code, brandSlug, modelSlug));
}

export type SeedGeneration = {
  code: string;
  name: string;
  yearFrom: number;
  yearTo: number | null;
  imageUrl: string;
};

export type SeedModel = {
  name: string;
  slug: string;
  generations: SeedGeneration[];
};

export type SeedBrand = {
  name: string;
  slug: string;
  logoUrl: string;
  sortOrder: number;
  models: SeedModel[];
};

type VehiclesDb = {
  v: string;
  makes: [string, string, string[]][];
  models: [string, string, string, string, string?][];
};

/** All vehicle kinds from global registry */
const VEHICLE_KINDS = ["car", "van", "truck", "motorcycle", "moped", "bus"] as const;
type VehicleKind = (typeof VEHICLE_KINDS)[number];

const KIND_LABELS: Record<string, string> = {
  van: "фургон",
  truck: "грузовик",
  motorcycle: "мотоцикл",
  moped: "мопед",
  bus: "автобус",
};

function displayModelName(name: string, kind: string) {
  if (kind === "car") return name;
  const label = KIND_LABELS[kind];
  return label ? `${name} (${label})` : name;
}

function normalizeBrandKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeModelKey(name: string) {
  return normalizeModelMatchKey(name);
}

function modelMatchKey(brandName: string, modelName: string) {
  return `${normalizeBrandKey(brandName)}|${normalizeModelKey(modelName)}`;
}

function pickBetterName(a: string, b: string) {
  const score = (s: string) => {
    let n = 0;
    if (/series/i.test(s)) n += 3;
    if (/^[A-Z]/.test(s)) n += 2;
    if (s.length > 3 && s.length < 30) n += 1;
    if (/[äöüß]/i.test(s)) n -= 1;
    if (s === s.toUpperCase() && s.length > 4) n -= 2;
    return n;
  };
  return score(a) >= score(b) ? a : b;
}

function loadVehiclesDb(): VehiclesDb | null {
  const file = path.join(process.cwd(), "prisma/data/vehicles.min.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as VehiclesDb;
}

function buildGenerationsIndex() {
  const index = new Map<string, SeedGeneration[]>();
  const overrides = buildGenerationOverridesIndex();
  for (const [key, gens] of overrides) {
    index.set(key, gens);
  }

  for (const brandName of getBrands()) {
    const brand = getBrand(brandName);
    if (!brand) continue;

    for (const model of brand.models) {
      const generations: SeedGeneration[] = [];

      for (const gen of model.generations) {
        for (const code of parseGenerationCodes(gen.name)) {
          if (!code || generations.some((g) => g.code === code)) continue;
          if (!isValidGenerationCode(code)) continue;
          generations.push({
            code,
            name: formatGenerationTitle(brandName, code),
            yearFrom: gen.yearFrom,
            yearTo: gen.yearTo,
            imageUrl: PLACEHOLDER_IMAGE,
          });
        }
      }

      if (generations.length === 0) continue;
      const key = modelMatchKey(brandName, model.name);
      if (overrides.has(key)) continue;
      const existing = index.get(key);
      if (existing) {
        const codes = new Set(existing.map((g) => g.code));
        for (const g of generations) {
          if (!codes.has(g.code)) existing.push(g);
        }
      } else {
        index.set(key, generations);
      }
    }
  }

  return index;
}

function defaultGeneration(brandName: string, modelName: string): SeedGeneration[] {
  return [{
    code: "ALL",
    name: `${brandName} ${modelName}`,
    yearFrom: 1900,
    yearTo: null,
    imageUrl: PLACEHOLDER_IMAGE,
  }];
}

export function buildCarCatalogFromPackage(): SeedBrand[] {
  const generationsIndex = buildGenerationsIndex();
  const brandMap = new Map<string, {
    name: string;
    slug: string;
    models: Map<string, { name: string; slug: string; generations: SeedGeneration[] }>;
  }>();

  function ensureBrand(name: string, slug?: string) {
    const s = slug ?? brandToSlug(name);
    const key = normalizeBrandKey(name);
    if (!brandMap.has(key)) {
      brandMap.set(key, { name, slug: s, models: new Map() });
    } else {
      const b = brandMap.get(key)!;
      b.name = pickBetterName(b.name, name);
    }
    return brandMap.get(key)!;
  }

  function addModel(
    brandName: string,
    brandSlug: string,
    modelName: string,
    modelSlug?: string,
    kind: string = "car"
  ) {
    const brand = ensureBrand(brandName, brandSlug);
    const displayName = displayModelName(modelName, kind);
    const mKey = `${kind}|${normalizeModelKey(modelName)}`;
    const genKey = modelMatchKey(brandName, modelName);
    let generations = filterGenerations(
      generationsIndex.get(genKey) ?? defaultGeneration(brandName, displayName),
      brandSlug,
      modelSlug ?? modelToSlug(modelName)
    );
    const fromOverride = generationsIndex.has(genKey) && generations.some((g) => g.code !== "ALL");

    if (brand.models.has(mKey)) {
      const existing = brand.models.get(mKey)!;
      existing.name = pickBetterName(existing.name, displayName);
      const fromAutoParts = generationsIndex.has(genKey);
      const hasRealGens = generations.some((g) => g.code !== "ALL");
      if (
        (existing.generations.length === 1 && existing.generations[0].code === "ALL" && hasRealGens) ||
        (fromAutoParts && hasRealGens) ||
        (fromOverride && hasRealGens)
      ) {
        existing.generations = generations;
      }
    } else {
      const baseSlug = modelSlug ?? modelToSlug(modelName);
      let slug = kind === "car" ? baseSlug : `${baseSlug}-${kind}`;
      let n = 2;
      const used = new Set([...brand.models.values()].map((m) => m.slug));
      while (used.has(slug)) slug = `${baseSlug}-${kind}-${n++}`;

      brand.models.set(mKey, { name: displayName, slug, generations });
    }
  }

  // 1) VehiclesDB — all kinds (cars, vans, trucks, motorcycles, mopeds, buses)
  const vdb = loadVehiclesDb();
  if (vdb) {
    const makeNames = new Map(vdb.makes.map(([slug, name]) => [slug, name]));
    const kindSet = new Set<string>(VEHICLE_KINDS);
    for (const [makeSlug, , modelName, kind] of vdb.models.filter((m) => kindSet.has(m[3]))) {
      const brandName = makeNames.get(makeSlug) ?? makeSlug;
      addModel(brandName, makeSlug, modelName, modelToSlug(modelName), kind);
    }
  }

  // 2) auto-parts-db — extra brands/models with generations
  for (const brandName of getBrands()) {
    const brand = getBrand(brandName);
    if (!brand) continue;
    for (const model of brand.models) {
      addModel(brandName, brandToSlug(brandName), model.name);
    }
  }

  // 3) NHTSA — all US vehicle types
  const nhtsaSeen = new Set<string>();
  for (const m of getModels()) {
    const key = `${m.makeName}|${m.modelName}`;
    if (nhtsaSeen.has(key)) continue;
    nhtsaSeen.add(key);
    addModel(m.makeName, brandToSlug(m.makeName), m.modelName);
  }

  const sorted = [...brandMap.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));

  // Merge duplicate slugs (e.g. Citroën / CITROEN)
  const bySlug = new Map<string, SeedBrand>();
  for (const brand of sorted) {
    const existing = bySlug.get(brand.slug);
    if (!existing) {
      bySlug.set(brand.slug, {
        name: brand.name,
        slug: brand.slug,
        logoUrl: carLogoUrl(brand.slug),
        sortOrder: 0,
        models: [...brand.models.values()],
      });
    } else {
      existing.name = pickBetterName(existing.name, brand.name);
      const modelKeys = new Set(existing.models.map((m) => {
        const kind = m.slug.includes("-van") ? "van" : m.slug.includes("-truck") ? "truck" : m.slug.includes("-motorcycle") ? "motorcycle" : m.slug.includes("-moped") ? "moped" : m.slug.includes("-bus") ? "bus" : "car";
        return `${kind}|${normalizeModelKey(m.name.replace(/\s*\([^)]+\)$/, ""))}`;
      }));
      for (const m of brand.models.values()) {
        const kind = m.slug.includes("-van") ? "van" : m.slug.includes("-truck") ? "truck" : m.slug.includes("-motorcycle") ? "motorcycle" : m.slug.includes("-moped") ? "moped" : m.slug.includes("-bus") ? "bus" : "car";
        const k = `${kind}|${normalizeModelKey(m.name.replace(/\s*\([^)]+\)$/, ""))}`;
        if (!modelKeys.has(k)) {
          existing.models.push(m);
          modelKeys.add(k);
        }
      }
    }
  }

  return [...bySlug.values()].map((brand, index) => ({
    ...brand,
    sortOrder: index + 1,
  })).filter((b) => b.models.length > 0);
}

export function getCatalogStats(catalog: SeedBrand[]) {
  const models = catalog.reduce((s, b) => s + b.models.length, 0);
  const generations = catalog.reduce(
    (s, b) => s + b.models.reduce((ms, m) => ms + m.generations.length, 0),
    0
  );
  return { brands: catalog.length, models, generations };
}
