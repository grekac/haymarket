import { isRealCarPhoto } from "./car-images";
import { displayGenerationCode } from "./car-generation-display";

export type RawGeneration = {
  id: string;
  code: string;
  name: string | null;
  yearFrom: number;
  yearTo: number | null;
  imageUrl: string;
  modelId: string;
};

export type BodyVariant = {
  id: string;
  code: string;
  label: string;
};

export type GroupedGeneration = RawGeneration & {
  variants: BodyVariant[];
};

const BMW_MINI_BRANDS = new Set(["bmw", "mini"]);

const BODY_SUFFIX_LABELS: Record<string, string> = {
  "0": "Седан",
  "1": "Универсал",
  "2": "Купе",
  "3": "Кабриолет",
  "4": "Gran Turismo",
  "5": "Длинная база",
  "6": "Gran Coupé",
  "7": "GT / Active",
  "8": "Спецверсия",
};

function normalizeCode(code: string) {
  return code.split("/")[0].trim().toUpperCase();
}

function expandCodes(code: string): string[] {
  const c = code.trim();
  if (c.includes("/")) {
    return c.split("/").map((p) => normalizeCode(p)).filter(Boolean);
  }
  return [normalizeCode(c)];
}

/** F10/F11/F07 — одно поколение BMW 5-й серии */
function bmwSpecialPlatformKey(c: string, codes: string[]): string | null {
  const normalized = codes.map((x) => normalizeCode(x));
  const hasF07 = normalized.includes("F07");
  const hasF10 = normalized.some((x) => x === "F10" || x === "F11");
  if (hasF07 && hasF10 && (c === "F07" || c === "F10" || c === "F11")) {
    return "bmw:f10-5gen";
  }
  return null;
}

/** BMW E90/E91, Mercedes W204/S204, одинаковые годы — варианты кузова */
function bmwMiniFamilyKey(c: string, codes: string[]): string | null {
  if (BMW_STANDALONE_CODES.has(c)) return null;

  const bodyFamily = c.match(/^([A-Z])([1-9])([0-8])$/);
  if (!bodyFamily || !codes.length) return null;

  const prefix = `${bodyFamily[1]}${bodyFamily[2]}`;
  const family = codes.filter((fc) => {
    if (BMW_STANDALONE_CODES.has(fc)) return false;
    const fm = fc.match(/^([A-Z])([1-9])([0-8])$/);
    return fm && `${fm[1]}${fm[2]}` === prefix;
  });
  if (family.length < 2) return null;

  const base = `${prefix}0`;
  const hasBase = family.includes(base);
  const hasVariant = family.some((fc) => {
    if (fc === base) return false;
    const suffix = fc.slice(-1);
    return /^[1-4]$/.test(suffix);
  });
  if (hasBase && hasVariant) return `bmw:${prefix}`;
  return null;
}

/** Mercedes / Audi / все марки: W204 + S204 + C204 — одна платформа */
function mercPlatformKey(c: string, codes: string[]): string | null {
  const m = c.match(/^([WSCAVF])(\d{3})$/);
  if (!m || !codes.length) return null;
  const platform = m[2];
  const family = codes.filter((fc) => {
    const fm = fc.match(/^([WSCAVF])(\d{3})$/);
    return fm && fm[2] === platform;
  });
  if (family.length >= 2) return `merc:${platform}`;
  return null;
}

/** Любая марка: X#0 + X#1–4 — варианты кузова (как BMW E90/E91) */
function universalBodyFamilyKey(c: string, codes: string[]): string | null {
  if (BMW_STANDALONE_CODES.has(c)) return null;

  const bodyFamily = c.match(/^([A-Z])([1-9])([0-8])$/);
  if (!bodyFamily || !codes.length) return null;

  const prefix = `${bodyFamily[1]}${bodyFamily[2]}`;
  const family = codes.filter((fc) => {
    if (BMW_STANDALONE_CODES.has(fc)) return false;
    const fm = fc.match(/^([A-Z])([1-9])([0-8])$/);
    return fm && `${fm[1]}${fm[2]}` === prefix;
  });
  if (family.length < 2) return null;

  const base = `${prefix}0`;
  const hasBase = family.includes(base);
  const hasVariant = family.some((fc) => {
    if (fc === base) return false;
    return /^[1-4]$/.test(fc.slice(-1));
  });
  if (hasBase && hasVariant) return `body:${prefix}`;
  return null;
}

/** Старые BMW-коды (E21, E30…) — отдельные поколения, не варианты кузова E90/E91 */
const BMW_STANDALONE_CODES = new Set([
  "E12", "E21", "E28", "E30", "E34", "E36", "E39", "E46",
  "E23", "E24", "E26", "E31", "E32", "E38", "E52", "E53",
  "E63", "E64", "E65", "E66", "E67", "E68", "E81", "E82", "E83", "E84", "E85", "E86", "E87", "E88", "E89",
]);

function isStandaloneGeneration(c: string): boolean {
  if (c === "ALL") return true;
  if (BMW_STANDALONE_CODES.has(c)) return true;
  return false;
}

export function getGenerationGroupKey(
  code: string,
  brandSlug?: string,
  allCodes: string[] = []
): string {
  const expanded = expandCodes(code);
  const c = expanded[0];
  if (!c || c === "ALL") return c;

  const brand = brandSlug?.toLowerCase() ?? "";
  const codes = allCodes.flatMap(expandCodes);

  if (BMW_MINI_BRANDS.has(brand) || brand === "") {
    const special = bmwSpecialPlatformKey(c, codes);
    if (special) return special;
    const bmwKey = bmwMiniFamilyKey(c, codes);
    if (bmwKey) return bmwKey;
  }

  if (isStandaloneGeneration(c)) return c;

  if (BMW_MINI_BRANDS.has(brand)) {
    const bodyKey = universalBodyFamilyKey(c, codes);
    if (bodyKey) return bodyKey;
  }

  const mercKey = mercPlatformKey(c, codes);
  if (mercKey) return mercKey;

  return c;
}

/** Поколения с одинаковыми годами — только если коды похожи на варианты кузова */
function areSameYearBodyVariants(codes: string[]): boolean {
  if (codes.length < 2) return false;

  if (codes.every((c) => /^[A-Z]{2}$/.test(c))) return true;

  return false;
}

/** Группировка по одинаковым годам выпуска (только варианты кузова) */
function buildYearGroups(gens: RawGeneration[]): Map<string, RawGeneration[]> {
  const buckets = new Map<string, RawGeneration[]>();
  for (const g of gens) {
    if (isStandaloneGeneration(normalizeCode(g.code))) continue;
    const yk = `${g.yearFrom}|${g.yearTo ?? "null"}`;
    const list = buckets.get(yk) ?? [];
    list.push(g);
    buckets.set(yk, list);
  }
  return buckets;
}

export function getPrimaryGenerationCode(
  codes: string[],
  brandSlug?: string,
  catalogOrder: string[] = []
): string {
  const normalized = codes.flatMap(expandCodes);
  const allCodes = codes;

  const base = normalized.find((c) => {
    const m = c.match(/^([A-Z])([1-9])0$/);
    const key = getGenerationGroupKey(c, brandSlug, allCodes);
    return m && (key === `bmw:${m[1]}${m[2]}` || key === `body:${m[1]}${m[2]}`);
  });
  if (base) return base;

  if (normalized.includes("F10")) return "F10";
  if (normalized.includes("F07")) return "F07";

  const mercBase = normalized.find((c) => /^W\d{3}$/.test(c));
  if (mercBase && normalized.some((x) => x !== mercBase && /^[SCAVF]\d{3}$/.test(x))) {
    return mercBase;
  }

  if (catalogOrder.length) {
    for (const raw of catalogOrder) {
      const c = normalizeCode(raw);
      if (normalized.includes(c)) return c;
    }
  }

  return [...normalized].sort((a, b) => a.localeCompare(b))[0];
}

export function getBodyVariantLabel(code: string, brandSlug?: string): string {
  const c = expandCodes(code)[0];
  const brand = brandSlug?.toLowerCase() ?? "";

  const bodyFamily = c.match(/^([A-Z])([1-9])([0-8])$/);
  if (bodyFamily) {
    const suffix = BODY_SUFFIX_LABELS[bodyFamily[3]] ?? `Кузов ${bodyFamily[3]}`;
    return `${c} · ${suffix}`;
  }

  if (c === "F07" && BMW_MINI_BRANDS.has(brand)) {
    return `${c} · Gran Turismo`;
  }

  const merc = c.match(/^([WSCAVF])(\d{3})$/);
  if (merc) {
    const labels: Record<string, string> = {
      W: "Седан",
      S: "Универсал",
      C: "Купе",
      A: "Седан",
      V: "Минивэн",
      F: "Купе",
    };
    const body = labels[merc[1]] ?? merc[1];
    return `${c} · ${body}`;
  }

  return c;
}

function resolveGroupKey(
  gen: RawGeneration,
  brandSlug: string | undefined,
  allCodes: string[],
  yearOverrides: Map<string, string>
): string {
  const c = normalizeCode(gen.code);
  const explicit = getGenerationGroupKey(c, brandSlug, allCodes);
  if (explicit !== c) return explicit;

  const yk = `${gen.yearFrom}|${gen.yearTo ?? "null"}`;
  if (yearOverrides.has(`${gen.id}:${yk}`)) {
    return yearOverrides.get(`${gen.id}:${yk}`)!;
  }
  return explicit;
}

export function groupGenerationsForDisplay(
  gens: RawGeneration[],
  brandSlug?: string,
  modelSlug?: string
): GroupedGeneration[] {
  const allCodes = gens.map((g) => g.code);
  const yearBuckets = buildYearGroups(gens);
  const yearOverrides = new Map<string, string>();

  for (const [yk, bucket] of yearBuckets) {
    if (bucket.length < 2) continue;
    const codes = bucket.map((g) => normalizeCode(g.code));
    const allStandalone = codes.every(isStandaloneGeneration);
    if (allStandalone) continue;
    if (!areSameYearBodyVariants(codes)) continue;

    const groupId = `years:${yk}`;
    for (const g of bucket) {
      yearOverrides.set(`${g.id}:${yk}`, groupId);
    }
  }

  const buckets = new Map<string, RawGeneration[]>();

  for (const gen of gens) {
    const explicitKey = resolveGroupKey(gen, brandSlug, allCodes, yearOverrides);
    const c = normalizeCode(gen.code);
    const hasExplicitGroup = explicitKey !== c && !explicitKey.startsWith("years:");

    const yk = `${gen.yearFrom}|${gen.yearTo ?? "null"}`;
    const yearKey = yearOverrides.get(`${gen.id}:${yk}`);
    const key = hasExplicitGroup ? explicitKey : (yearKey ?? explicitKey);

    const list = buckets.get(key) ?? [];
    list.push(gen);
    buckets.set(key, list);
  }

  const grouped: GroupedGeneration[] = [];

  for (const [, variants] of buckets) {
    const codes = variants.map((v) => v.code);
    const primaryCode = getPrimaryGenerationCode(codes, brandSlug, allCodes);
    const primary =
      variants.find((v) => normalizeCode(v.code) === primaryCode) ??
      variants.find((v) => expandCodes(v.code)[0] === primaryCode) ??
      variants[0];

    const primaryPhoto =
      (isRealCarPhoto(primary.imageUrl) ? primary.imageUrl : null) ??
      variants.map((v) => v.imageUrl).find((url) => isRealCarPhoto(url)) ??
      primary.imageUrl;

    const sameYears = variants.every(
      (v) => v.yearFrom === variants[0].yearFrom && v.yearTo === variants[0].yearTo
    );
    const yearFrom = sameYears ? primary.yearFrom : Math.min(...variants.map((v) => v.yearFrom));
    const yearToValues = (sameYears ? [primary] : variants)
      .map((v) => v.yearTo)
      .filter((y): y is number => y != null);
    const yearTo = yearToValues.length
      ? sameYears
        ? primary.yearTo
        : Math.max(...yearToValues)
      : null;

    const displayCode = displayGenerationCode(primaryCode, brandSlug, modelSlug);
    const displayName = primary.name?.includes(displayCode)
      ? primary.name
      : displayCode;

    grouped.push({
      ...primary,
      code: displayCode,
      name: displayName,
      yearFrom,
      yearTo,
      imageUrl: primaryPhoto,
      variants: variants
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((v) => ({
          id: v.id,
          code: v.code,
          label: getBodyVariantLabel(v.code, brandSlug),
        })),
    });
  }

  return grouped.sort((a, b) => a.yearFrom - b.yearFrom || a.code.localeCompare(b.code));
}

export function getVariantCodesForPrimary(
  allCodes: string[],
  primaryCode: string,
  brandSlug?: string
): string[] {
  const primary = normalizeCode(primaryCode);
  const key = getGenerationGroupKey(primary, brandSlug, allCodes);
  return allCodes.filter(
    (c) => getGenerationGroupKey(normalizeCode(c), brandSlug, allCodes) === key
  );
}

export function getVariantCodesFromGenerations(
  gens: RawGeneration[],
  primaryCode: string,
  brandSlug?: string
): string[] {
  const grouped = groupGenerationsForDisplay(gens, brandSlug);
  const match = grouped.find((g) => normalizeCode(g.code) === normalizeCode(primaryCode));
  if (match) return match.variants.map((v) => v.code);
  return [normalizeCode(primaryCode)];
}
