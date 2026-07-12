import { PLACEHOLDER_IMAGE } from "./car-catalog-utils";
import { lookupGenerationImage } from "./car-generation-images";

const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

function wikiEncode(s: string) {
  return encodeURIComponent(s.replace(/ /g, "_"));
}

function primaryCode(code: string) {
  return code.split("/")[0].trim();
}

function cleanModel(model: string) {
  return model.replace(/\s*\([^)]+\)$/, "").trim();
}

function buildTitleCandidates(brand: string, model: string, code: string): string[] {
  const c = primaryCode(code);
  const modelClean = cleanModel(model.replace(/\s+/g, " ").trim());
  const titles: string[] = [];
  const add = (t: string) => {
    if (t && !titles.includes(t)) titles.push(t);
  };

  if (code === "ALL") {
    add(`${brand} ${modelClean}`);
    add(`${brand}_${modelClean.replace(/ /g, "_")}`);
    add(modelClean);
    add(`${brand} ${modelClean} car`);
    add(`${brand} ${modelClean} automobile`);
    return titles;
  }

  const seriesNum = modelClean.match(/^Series\s+(\d+)/i);
  if (seriesNum) {
    add(`${brand}_${seriesNum[1]}_Series_(${c})`);
    add(`${brand} ${seriesNum[1]} Series (${c})`);
    add(`${brand} ${c}`);
    add(`${brand}_${c}`);
  }

  if (/^Mk\d+$/i.test(c)) {
    add(`${brand}_${modelClean.replace(/ /g, "_")}_(${c})`);
    add(`${brand} ${modelClean} (${c})`);
    if (/volkswagen/i.test(brand) && /golf/i.test(modelClean)) {
      add(`Volkswagen_Golf_${c}`);
      add(`Volkswagen Golf (${c})`);
    }
  }

  if (/mercedes/i.test(brand)) {
    add(`Mercedes-Benz_${modelClean.replace(/ /g, "_")}_(${c})`);
    add(`Mercedes-Benz ${modelClean} (${c})`);
    add(`Mercedes-Benz_${c}`);
    add(`Mercedes-Benz ${c}`);
  }

  if (/^W\d{3}$/i.test(c) || /^[A-Z]\d{3}$/i.test(c)) {
    add(`${brand}_${c}`);
    add(`${brand} ${c}`);
  }

  add(`${brand} ${modelClean} (${c})`);
  add(`${brand}_${modelClean.replace(/ /g, "_")}_(${c})`);
  add(`${brand} ${c}`);
  add(`${brand}_${c}`);
  add(`${modelClean} (${c})`);
  add(`${brand} ${modelClean} ${c}`);
  add(`${c} ${brand}`);

  return titles;
}

async function fetchWikiThumb(title: string): Promise<string | null> {
  try {
    const res = await fetch(`${WIKI_API}${wikiEncode(title)}`, {
      headers: { "User-Agent": "HayMarket/1.0 (haymarket.am)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const src = data.thumbnail?.source as string | undefined;
    if (!src) return null;
    return src.replace(/\/\d+px-/, "/640px-");
  } catch {
    return null;
  }
}

async function fetchCommonsImage(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrnamespace: "6",
      gsrlimit: "10",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "640",
      format: "json",
      origin: "*",
    });
    const res = await fetch(`${COMMONS_API}?${params}`, {
      headers: { "User-Agent": "HayMarket/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    for (const page of Object.values(pages) as { title?: string; imageinfo?: { thumburl?: string; url?: string }[] }[]) {
      const title = page.title?.toLowerCase() ?? "";
      if (title.includes("logo") || title.includes("icon") || title.includes("badge")) continue;
      const thumb = page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url;
      if (thumb) return thumb;
    }
    return null;
  } catch {
    return null;
  }
}

function commonsQueries(brand: string, model: string, code: string): string[] {
  const modelClean = cleanModel(model);
  const c = primaryCode(code);
  if (code === "ALL") {
    return [
      `${brand} ${modelClean} car`,
      `${brand} ${modelClean} automobile`,
      `${modelClean} ${brand}`,
    ];
  }

  const queries = [
    `${brand} ${modelClean} ${c}`,
    `${brand} ${c} car`,
    `${brand} ${c} automobile`,
    `${brand} ${modelClean} (${c})`,
    `${c} ${brand} car`,
  ];

  const seriesNum = modelClean.match(/^Series\s+(\d+)/i);
  if (seriesNum) {
    queries.unshift(`${brand} ${seriesNum[1]} Series ${c}`);
    queries.unshift(`${brand} ${c}`);
  }

  if (/mercedes/i.test(brand)) {
    queries.unshift(`Mercedes-Benz ${modelClean} ${c}`);
    queries.unshift(`Mercedes-Benz ${c}`);
  }

  return queries;
}

export function isRealCarPhoto(url: string | null | undefined) {
  if (!url) return false;
  if (url === PLACEHOLDER_IMAGE) return false;
  if (url.includes("car-logos-dataset")) return false;
  if (url.includes("__initials__")) return false;
  return true;
}

export async function resolveGenerationImage(
  brand: string,
  model: string,
  code: string,
  brandLogoUrl?: string | null,
  brandSlug?: string,
  modelSlug?: string
): Promise<string | null> {
  if (brandSlug && modelSlug) {
    const cached = lookupGenerationImage(brandSlug, modelSlug, code);
    if (isRealCarPhoto(cached)) return cached;
  }

  for (const title of buildTitleCandidates(brand, model, code)) {
    const url = await fetchWikiThumb(title);
    if (isRealCarPhoto(url)) return url;
    await new Promise((r) => setTimeout(r, 120));
  }

  for (const q of commonsQueries(brand, model, code)) {
    const url = await fetchCommonsImage(q);
    if (isRealCarPhoto(url)) return url;
  }

  return null;
}

export function isPlaceholderImage(url: string | null | undefined) {
  return !url || url === PLACEHOLDER_IMAGE || !isRealCarPhoto(url);
}
