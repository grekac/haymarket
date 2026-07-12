import { PLACEHOLDER_IMAGE, normalizeModelMatchKey } from "./car-catalog-utils";

type SeedGeneration = {
  code: string;
  name: string;
  yearFrom: number;
  yearTo: number | null;
  imageUrl: string;
};

type OverrideDef = {
  brand: string;
  modelName: string;
  modelKeys: string[];
  generations: { code: string; yearFrom: number; yearTo: number | null; label: string }[];
};

/** Поколения как на Авито: короткая подпись + точные годы */
const OVERRIDES: OverrideDef[] = [
  {
    brand: "Mercedes-Benz",
    modelName: "CLS",
    modelKeys: ["cls"],
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
    modelName: "G-Class",
    modelKeys: ["g"],
    generations: [
      { code: "W465 FL", yearFrom: 2024, yearTo: null, label: "W465 рестайлинг" },
      { code: "W463 II", yearFrom: 2018, yearTo: 2025, label: "W463" },
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

function normalizeModelKey(name: string) {
  return normalizeModelMatchKey(name);
}

export function buildGenerationOverridesIndex(): Map<string, SeedGeneration[]> {
  const index = new Map<string, SeedGeneration[]>();

  for (const item of OVERRIDES) {
    const brandKey = normalizeBrandKey(item.brand);
    for (const modelKey of item.modelKeys) {
      const gens: SeedGeneration[] = item.generations.map((g) => ({
        code: g.code,
        name: g.label,
        yearFrom: g.yearFrom,
        yearTo: g.yearTo,
        imageUrl: PLACEHOLDER_IMAGE,
      }));
      index.set(`${brandKey}|${modelKey}`, gens);
    }
  }

  return index;
}

export function modelMatchKeyFromNames(brandName: string, modelName: string) {
  return `${normalizeBrandKey(brandName)}|${normalizeModelKey(modelName)}`;
}
