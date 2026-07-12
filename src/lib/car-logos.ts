const LOGO_CDN = "https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos";
const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

export const LOGO_INITIALS = "__initials__";

const LOGO_SLUG_ALIASES: Record<string, string[]> = {
  "mercedes-benz": ["mercedes", "mercedes-benz"],
  "land-rover": ["landrover", "land-rover"],
  "alfa-romeo": ["alfa-romeo", "alfa"],
  "rolls-royce": ["rolls-royce", "rollsroyce"],
  "aston-martin": ["aston-martin", "astonmartin"],
  "great-wall": ["great-wall", "greatwall"],
  "mercedes-benz-trucks": ["mercedes-benz"],
  seat: ["seat"],
  citroen: ["citroen"],
  skoda: ["skoda"],
  bmw: ["bmw"],
  audi: ["audi"],
  toyota: ["toyota"],
  honda: ["honda"],
  hyundai: ["hyundai"],
  kia: ["kia"],
  nissan: ["nissan"],
  ford: ["ford"],
  chevrolet: ["chevrolet"],
  volkswagen: ["volkswagen"],
  tesla: ["tesla"],
  porsche: ["porsche"],
  ferrari: ["ferrari"],
  lamborghini: ["lamborghini"],
  mazda: ["mazda"],
  subaru: ["subaru"],
  mitsubishi: ["mitsubishi"],
  lexus: ["lexus"],
  infiniti: ["infiniti"],
  acura: ["acura"],
  genesis: ["genesis"],
  volvo: ["volvo"],
  jaguar: ["jaguar"],
  "mini-cooper": ["mini"],
  mini: ["mini"],
  jeep: ["jeep"],
  dodge: ["dodge"],
  chrysler: ["chrysler"],
  cadillac: ["cadillac"],
  buick: ["buick"],
  gmc: ["gmc"],
  lada: ["lada", "vaz"],
  uaz: ["uaz"],
  gaz: ["gaz"],
  renault: ["renault"],
  peugeot: ["peugeot"],
  opel: ["opel"],
  fiat: ["fiat"],
  dacia: ["dacia"],
  suzuki: ["suzuki"],
  isuzu: ["isuzu"],
  yamaha: ["yamaha"],
  kawasaki: ["kawasaki"],
  "harley-davidson": ["harley-davidson"],
  ducati: ["ducati"],
  "bmw-motorrad": ["bmw"],
  byd: ["byd"],
  geely: ["geely"],
  chery: ["chery"],
  haval: ["haval"],
  mg: ["mg"],
  ssangyong: ["ssangyong"],
  daewoo: ["daewoo"],
  saab: ["saab"],
  pontiac: ["pontiac"],
  hummer: ["hummer"],
  scion: ["scion"],
  saturn: ["saturn"],
  plymouth: ["plymouth"],
  oldsmobile: ["oldsmobile"],
  mercury: ["mercury"],
  lincoln: ["lincoln"],
  bentley: ["bentley"],
  maserati: ["maserati"],
  bugatti: ["bugatti"],
  mclaren: ["mclaren"],
  lotus: ["lotus"],
  smart: ["smart"],
  cupra: ["cupra", "seat"],
};

export function logoSlugVariants(slug: string, name?: string): string[] {
  const out = new Set<string>();
  out.add(slug);

  for (const s of LOGO_SLUG_ALIASES[slug] ?? []) out.add(s);

  const noHyphen = slug.replace(/-/g, "");
  if (noHyphen) out.add(noHyphen);

  const parts = slug.split("-").filter(Boolean);
  if (parts.length > 1) out.add(parts[0]);

  if (name) {
    const fromName = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (fromName) out.add(fromName);
    const firstWord = name.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (firstWord && firstWord.length > 2) out.add(firstWord);
  }

  return [...out];
}

export function getLogoUrlCandidates(slug: string, name?: string): string[] {
  const urls = new Set<string>();

  for (const s of logoSlugVariants(slug, name)) {
    urls.add(`${LOGO_CDN}/thumb/${s}.png`);
    urls.add(`${LOGO_CDN}/optimized/${s}.png`);
    urls.add(`${LOGO_CDN}/${s}.png`);
  }

  return [...urls];
}

export function brandInitials(name: string) {
  const clean = name.replace(/[^a-zA-ZА-Яа-я0-9\s]/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase() || "?";
}

export function isValidLogoUrl(url: string | null | undefined) {
  return !!url && url !== LOGO_INITIALS && !url.includes("car-logos-dataset");
}

function wikiEncode(s: string) {
  return encodeURIComponent(s.replace(/ /g, "_"));
}

async function fetchWikiThumb(title: string): Promise<string | null> {
  try {
    const res = await fetch(`${WIKI_API}${wikiEncode(title)}`, {
      headers: { "User-Agent": "HayMarket/1.0 (haymarket.am)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const src = data.thumbnail?.source as string | undefined;
    if (!src) return null;
    return src.replace(/\/\d+px-/, "/200px-");
  } catch {
    return null;
  }
}

async function testUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "HayMarket/1.0" },
    });
    if (res.ok) return true;
  } catch { /* try GET */ }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "HayMarket/1.0", Range: "bytes=0-0" },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok || res.status === 206;
  } catch {
    return false;
  }
}

function brandWikiTitles(name: string): string[] {
  return [
    name,
    `${name} (automobile)`,
    `${name} Motor Company`,
    `${name} Motors`,
    `${name} AG`,
    `${name} Group`,
  ];
}

/** Resolve and cache a working logo URL for a brand */
export async function resolveBrandLogo(name: string, slug: string): Promise<string> {
  for (const url of getLogoUrlCandidates(slug, name)) {
    if (await testUrl(url)) return url;
  }

  for (const title of brandWikiTitles(name)) {
    const thumb = await fetchWikiThumb(title);
    if (thumb) return thumb;
  }

  // Wikimedia Commons logo search
  try {
    const q = `${name} logo automobile`;
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: q,
      gsrnamespace: "6",
      gsrlimit: "5",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "200",
      format: "json",
      origin: "*",
    });
    const res = await fetch(`${COMMONS_API}?${params}`, {
      headers: { "User-Agent": "HayMarket/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        for (const page of Object.values(pages) as { imageinfo?: { thumburl?: string }[] }[]) {
          const thumb = page.imageinfo?.[0]?.thumburl;
          if (thumb) return thumb;
        }
      }
    }
  } catch { /* skip */ }

  return LOGO_INITIALS;
}

export const POPULAR_BRAND_SLUGS = [
  "mercedes-benz", "bmw", "audi", "toyota", "honda", "hyundai", "kia",
  "nissan", "ford", "chevrolet", "volkswagen", "lexus", "tesla", "lada",
  "uaz", "gaz", "porsche", "mazda", "subaru", "mitsubishi", "renault",
  "peugeot", "skoda", "volvo", "jeep", "land-rover", "genesis", "byd",
  "geely", "chery", "haval", "opel", "dacia", "fiat", "jaguar", "mini",
  "infiniti", "cadillac", "suzuki", "yamaha", "kawasaki", "man", "iveco",
  "scania", "daewoo", "ssangyong", "bentley", "ferrari", "lamborghini",
  "citroen", "seat", "cupra", "acura", "chrysler", "dodge", "gmc",
  "buick", "lincoln", "ram", "isuzu", "daihatsu", "proton", "tata",
];

const POPULAR_ORDER = new Map(POPULAR_BRAND_SLUGS.map((s, i) => [s, i]));
const POPULAR_SET = new Set(POPULAR_BRAND_SLUGS);

/** Популярные сверху, остальные по алфавиту */
export function sortBrandsByPopularity<T extends { slug: string; name: string }>(brands: T[]): T[] {
  return [...brands].sort((a, b) => {
    const pa = POPULAR_ORDER.get(a.slug);
    const pb = POPULAR_ORDER.get(b.slug);
    if (pa !== undefined && pb !== undefined) return pa - pb;
    if (pa !== undefined) return -1;
    if (pb !== undefined) return 1;
    return a.name.localeCompare(b.name, "ru");
  });
}

export function splitBrandsByPopularity<T extends { slug: string }>(brands: T[]) {
  const sorted = sortBrandsByPopularity(brands);
  const popular: T[] = [];
  const other: T[] = [];
  for (const b of sorted) {
    if (POPULAR_SET.has(b.slug)) popular.push(b);
    else other.push(b);
  }
  return { popular, other };
}
