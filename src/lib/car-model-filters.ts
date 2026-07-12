export type CarModelWithGenerations = {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  generations?: { code: string }[];
};

const COMMERCIAL_SUFFIX =
  /\(фургон\)|\(грузовик\)|\(автобус\)|\(мотоцикл\)|\(мопед\)/i;

const CHASSIS_CODE = /^[A-Z]{1,2}\d{2,3}[a-z]?$/i;

const BMW_TRIM = /^M?(\d)(\d{2})([A-Za-z]{1,3}|ti|is|ic|xi|ix|ci|d)?$/;

const MERCEDES_TRIM = /^([A-Z]{1,3})(\d{2,3}[a-z]?)$/i;

const BODY_STYLES =
  /^(Sportback|Cabriolet|Limousine|Avant|Allroad|Coupe|Roadster|Sedan|Wagon|Variant|Plus|GTI|Alltrack|SportWagen|Cabrio|Touring|Sport|Hybrid|e-tron|E-Golf|R32|GLS|GT|TDI|TSI|R|Combi|Cross|Aerodeck)$/i;

const TRIM_SUFFIX =
  /\s+(DX|EX|LX|LE|SE|XLE|V6|V8|Type\s*R|Euro-?R|Sport\/?Touring|Sport|Touring|Hybrid|Plug-?in|PHEV|EV|Electric|\d+\.\d\w*|VTI|GTI|GTS|RS|ST|Si|Type-?S|\d+D|\d+P|AWD|4WD|Cabrio|Coupe|Wagon|Wagons|Van|Verso|Combi|Cross|Avant|Limousine|Sportback|Cabriolet|Allroad|Active|Alpina|B\d|i|d|e)\b/i;

function normalizeName(name: string) {
  return name.replace(/^Vw\s+/i, "").trim();
}

function hasRealGenerations(model: CarModelWithGenerations) {
  return (model.generations ?? []).some((g) => g.code && g.code !== "ALL");
}

function buildSeriesNumbers(models: CarModelWithGenerations[]): Set<number> {
  const series = new Set<number>();
  for (const model of models) {
    const fromSeries = model.name.match(/^Series\s+(\d+)$/i);
    if (fromSeries) series.add(Number(fromSeries[1]));
    const fromReihe = model.name.match(/^(\d+)\s+Series$/i);
    if (fromReihe) series.add(Number(fromReihe[1]));
  }
  return series;
}

function buildClassPrefixes(models: CarModelWithGenerations[]): Set<string> {
  const prefixes = new Set<string>();
  for (const model of models) {
    const classMatch = model.name.match(/^(.+?)-Class$/i);
    if (classMatch) prefixes.add(classMatch[1].replace(/\s+/g, "").toUpperCase());
  }
  return prefixes;
}

function buildBaseModelNames(models: CarModelWithGenerations[]): Set<string> {
  const names = new Set<string>();
  for (const model of models) {
    names.add(model.name);
    names.add(normalizeName(model.name));
  }
  return names;
}

function parseBmwTrimSeries(name: string): number | null {
  const compact = name.replace(/\s+/g, "");
  const match = compact.match(BMW_TRIM);
  if (!match) return null;
  return Number(match[1]);
}

function parseMercedesTrimPrefix(name: string): string | null {
  const compact = name.replace(/\s+/g, "");
  const match = compact.match(MERCEDES_TRIM);
  if (!match) return null;
  return match[1].toUpperCase();
}

function parseBodyVariantBase(name: string): string | null {
  const m = name.match(/^(.+?)\s+(.+)$/);
  if (!m) return null;
  if (BODY_STYLES.test(m[2].trim())) return m[1].trim();
  return null;
}

function isPrimaryModelName(name: string): boolean {
  const n = name.trim();
  if (/-Class$/i.test(n)) return true;
  if (/^Series\s+\d+$/i.test(n)) return true;
  if (/^X\s?\d+$/i.test(n)) return true;
  if (/^iX\d?$/i.test(n)) return true;
  if (/^M\s?\d+$/i.test(n)) return true;
  if (/^[A-Z]\d{1,2}$/i.test(n.replace(/\s/g, ""))) return true;
  if (/^[A-Z]\d\s+e-tron$/i.test(n)) return true;
  if (/^ID\.\d$/i.test(n)) return true;
  if (/^e-tron$/i.test(n)) return true;
  return false;
}

export function isTrimOrPackageName(
  name: string,
  ctx: {
    generationCodes: Set<string>;
    seriesNumbers: Set<number>;
    classPrefixes: Set<string>;
    baseNames: Set<string>;
    hasClassOrSeriesModels: boolean;
  }
): boolean {
  const trimmed = name.trim();
  const upper = trimmed.toUpperCase();
  const normalized = normalizeName(trimmed);

  if (COMMERCIAL_SUFFIX.test(trimmed)) return true;
  if (trimmed.includes(",")) return true;
  if (/Alpina|ActiveHybrid|ActiveE|Brabus|Burstner|Carthago|Binz|Isetta/i.test(trimmed)) return true;

  if (/^(Cabriolet|Coupe|Sedan|Wagon|Avant|Allroad|Roadster|Convertible|Diesel|Hybrid|Electric)$/i.test(trimmed)) {
    return true;
  }

  if (/^(Benz|Bm|Bmw|Audi|Mercedes|Toyota|Honda|Mini|Cooper|Active|Ci|Cs|Amg|Ambulance|Atego)$/i.test(trimmed)) {
    return true;
  }

  if (/^[A-Z]\s+\d+$/i.test(trimmed)) return true;

  if (/^[A-Z]$/i.test(trimmed) && ctx.classPrefixes.size > 0) return true;

  const shortClass = trimmed.match(/^(CLK|CLS|CLA|GLA|GLC|GLE|GLS|SLK|SL|CLC|CLE)$/i);
  if (shortClass && ctx.baseNames.has(`${shortClass[1]}-Class`)) return true;

  const spaced = trimmed.match(/^([A-Z])\s+(\d)$/i);
  if (spaced && ctx.baseNames.has(`${spaced[1]}${spaced[2]}`)) return true;

  if (/^\w+\s+\d{1,2}$/i.test(trimmed) && !isPrimaryModelName(trimmed)) return true;

  if (ctx.generationCodes.has(upper)) return true;

  const trimSeries = parseBmwTrimSeries(trimmed);
  if (trimSeries !== null && ctx.seriesNumbers.has(trimSeries)) return true;

  const mercPrefix = parseMercedesTrimPrefix(trimmed);
  if (mercPrefix && ctx.classPrefixes.has(mercPrefix)) return true;

  const variantBase = parseBodyVariantBase(trimmed);
  if (variantBase && (ctx.baseNames.has(variantBase) || ctx.baseNames.has(normalizeName(variantBase)))) {
    return true;
  }

  if (normalized !== trimmed && ctx.baseNames.has(normalized)) return true;

  if (TRIM_SUFFIX.test(trimmed)) return true;

  if (/^\d{2,4}[A-Z]?$/i.test(trimmed) && ctx.hasClassOrSeriesModels) return true;

  if (/^[A-Z]?\d{3}[A-Z]{0,3}$/i.test(trimmed.replace(/\s/g, "")) && ctx.hasClassOrSeriesModels) {
    if (!isPrimaryModelName(trimmed)) return true;
  }

  const serieDup = trimmed.match(/^Serie\s+(\d+)$/i);
  if (serieDup && ctx.seriesNumbers.has(Number(serieDup[1]))) return true;

  if (CHASSIS_CODE.test(trimmed)) return true;

  if (/\s+[A-Z]\d{1,3}$/i.test(trimmed) && !isPrimaryModelName(trimmed)) return true;

  return false;
}

function buildFilterContext(models: CarModelWithGenerations[]) {
  const generationCodes = new Set<string>();
  for (const model of models) {
    for (const gen of model.generations ?? []) {
      if (gen.code && gen.code !== "ALL") generationCodes.add(gen.code.toUpperCase());
    }
  }

  const seriesNumbers = buildSeriesNumbers(models);
  const classPrefixes = buildClassPrefixes(models);
  const baseNames = buildBaseModelNames(models);
  const hasClassOrSeriesModels = seriesNumbers.size > 0 || classPrefixes.size > 0;

  return { generationCodes, seriesNumbers, classPrefixes, baseNames, hasClassOrSeriesModels };
}

export function filterCarModelsForListing<T extends CarModelWithGenerations>(
  models: T[]
): T[] {
  const ctx = buildFilterContext(models);

  return models.filter((model) => {
    if (isTrimOrPackageName(model.name, ctx)) return false;

  if (isPrimaryModelName(model.name)) return true;
  if (hasRealGenerations(model)) {
    const name = model.name.trim();
    if (name.length >= 2 && !/^(A|B|C|D|E|M|S)$/i.test(name)) return true;
  }

    const gens = model.generations ?? [];
    if (gens.length === 1 && gens[0].code === "ALL") {
      const words = model.name.trim().split(/\s+/);
      if (words.length <= 2 && !TRIM_SUFFIX.test(model.name) && !/^\d/.test(model.name)) {
        return true;
      }
    }

    return false;
  });
}

export function extractTrimsForModel<T extends CarModelWithGenerations>(
  allModels: T[],
  parent: T
): string[] {
  const ctx = buildFilterContext(allModels);
  const trims: string[] = [];

  for (const model of allModels) {
    if (model.id === parent.id) continue;
    if (!isTrimOrPackageName(model.name, ctx)) continue;
    if (!trimBelongsToParent(model.name, parent.name, ctx)) continue;
    trims.push(model.name);
  }

  return [...new Set(trims)].sort((a, b) => a.localeCompare(b, "ru"));
}

function trimBelongsToParent(
  trimName: string,
  parentName: string,
  ctx: ReturnType<typeof buildFilterContext>
): boolean {
  const series = parseBmwTrimSeries(trimName);
  const parentSeries = parentName.match(/^Series\s+(\d+)$/i);
  if (series !== null && parentSeries && Number(parentSeries[1]) === series) return true;

  const merc = parseMercedesTrimPrefix(trimName);
  const parentClass = parentName.match(/^(.+?)-Class$/i);
  if (merc && parentClass) {
    const prefix = parentClass[1].replace(/\s+/g, "").toUpperCase();
    if (merc === prefix || merc.startsWith(prefix) || prefix.startsWith(merc)) return true;
  }

  const variantBase = parseBodyVariantBase(trimName);
  if (variantBase && (variantBase === parentName || normalizeName(variantBase) === parentName)) {
    return true;
  }

  if (trimName.toLowerCase().startsWith(parentName.toLowerCase() + " ")) return true;

  const parentFirst = parentName.split(/\s+/)[0];
  if (trimName.toLowerCase().startsWith(parentFirst.toLowerCase() + " ")) return true;

  return false;
}

export function sortModelsForDisplay<T extends { name: string }>(models: T[]): T[] {
  const score = (name: string) => {
    if (/-Class$/i.test(name)) return 0;
    if (/^Series\s+\d+$/i.test(name)) return 1;
    if (/^[A-Z]\d{1,2}$/i.test(name.replace(/\s/g, ""))) return 2;
    if (/^X\s?\d+$/i.test(name)) return 3;
    return 4;
  };

  return [...models].sort((a, b) => {
    const diff = score(a.name) - score(b.name);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, "ru");
  });
}

export function stripModelGenerations<T extends CarModelWithGenerations>(
  models: T[]
): Omit<T, "generations">[] {
  return models.map(({ generations: _generations, ...model }) => model);
}
