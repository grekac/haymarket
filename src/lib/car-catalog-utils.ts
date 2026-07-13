const BRAND_SLUG_MAP: Record<string, string> = {
  "ГАЗ": "gaz",
  "МАЗ": "maz",
  "УАЗ": "uaz",
  "ВАЗ": "lada",
  "ЗАЗ": "zaz",
  "Mercedes-Benz": "mercedes-benz",
  "Mercedes": "mercedes-benz",
  "BMW": "bmw",
  "Audi": "audi",
  "Volkswagen": "volkswagen",
  "Škoda": "skoda",
  "Skoda": "skoda",
  "Citroën": "citroen",
  "Citroen": "citroen",
  "Peugeot": "peugeot",
  "Renault": "renault",
  "Seat": "seat",
  "SEAT": "seat",
  "Alfa Romeo": "alfa-romeo",
  "Land Rover": "land-rover",
  "Range Rover": "land-rover",
  "MINI": "mini",
  "Mini": "mini",
  "SsangYong": "ssangyong",
  "Ssangyong": "ssangyong",
  "Lada": "lada",
  "UAZ": "uaz",
  "GAZ": "gaz",
  "Genesis": "genesis",
  "Infiniti": "infiniti",
  "Lexus": "lexus",
  "Chevrolet": "chevrolet",
  "Cadillac": "cadillac",
  "Chrysler": "chrysler",
  "Dodge": "dodge",
  "Jeep": "jeep",
  "Tesla": "tesla",
  "Porsche": "porsche",
  "Ferrari": "ferrari",
  "Lamborghini": "lamborghini",
  "Maserati": "maserati",
  "Bentley": "bentley",
  "Rolls-Royce": "rolls-royce",
  "Aston Martin": "aston-martin",
  "McLaren": "mclaren",
  "Bugatti": "bugatti",
  "BYD": "byd",
  "Geely": "geely",
  "Chery": "chery",
  "Haval": "haval",
  "Great Wall": "great-wall",
  "MG": "mg",
  "Opel": "opel",
  "Vauxhall": "vauxhall",
  "Dacia": "dacia",
  "Smart": "smart",
  "DS": "ds",
  "DS Automobiles": "ds",
  "Cupra": "cupra",
  "ZX": "zx",
  "Автокам": "avtokam",
  "ВАЗ": "lada",
  "ВИС": "vis",
  "ГАЗ": "gaz",
  "ЕрАЗ": "eraz",
  "ЗАЗ": "zaz",
  "ЗИЛ": "zil",
  "ИЖ": "izh",
  "КАМАЗ": "kamaz",
  "ЛиАЗ": "liaz",
  "ЛуАЗ": "luaz",
  "МАЗ": "maz",
  "Москвич": "moskvich",
  "НефАЗ": "nefaz",
  "ПАЗ": "paz",
  "СеАЗ": "seaz",
  "ТагАЗ": "tagaz",
  "УАЗ": "uaz",
  "Урал": "ural",
};

export function brandToSlug(name: string) {
  if (BRAND_SLUG_MAP[name]) return BRAND_SLUG_MAP[name];
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function carLogoUrl(slug: string) {
  return `https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/${slug}.png`;
}

export function formatYearRange(yearFrom: number, yearTo?: number | null) {
  const end = yearTo == null ? "н.в." : String(yearTo);
  return `${yearFrom} — ${end}`;
}

export function formatGenerationTitle(_brand: string, code: string) {
  return code;
}

/** Split "E65/E66", "Fifth gen (EG/EH/EJ)" or "Second gen (SY, SZ, AC)" into separate codes */
export function parseGenerationCodes(raw: string): string[] {
  const cleaned = raw.trim();

  const paren = cleaned.match(/\(([^)]+)\)/);
  if (paren) {
    const inner = paren[1].trim();
    const separator = inner.includes("/") ? "/" : inner.includes(",") ? "," : null;
    if (separator) {
      return inner
        .split(separator)
        .map((p) => normalizeCode(p.trim()))
        .filter(Boolean);
    }
    const single = normalizeCode(inner);
    if (single) {
      const chassis = cleaned.match(/^([A-Z]?\d{3}[A-Z]?)\s*\(/i);
      if (chassis && /facelift|рестайлинг|restyling/i.test(inner)) {
        return [`${chassis[1].toUpperCase()} II`];
      }
      return [single];
    }
  }

  if (cleaned.includes("/")) {
    const parts = cleaned.split("/").map((p) => normalizeCode(p.trim())).filter(Boolean);
    if (parts.length > 1 && parts.every((p) => /^[A-Z0-9]{1,4}$/i.test(p))) {
      return parts;
    }
    return parts;
  }
  return [normalizeCode(cleaned)];
}

function normalizeCode(part: string) {
  const mk = part.match(/^Mk\d+/i);
  if (mk) return mk[0];
  const chassis = part.match(/^([A-Z]{1,3}\d{1,3}[a-z]?)/i);
  if (chassis) return chassis[1].toUpperCase();
  const paren = part.match(/\(([^)]+)\)/);
  if (paren) return paren[1].trim();
  return part.replace(/\s*\(.*\)/, "").trim();
}

export function modelToSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Ключ для сопоставления модели с поколениями (override, sync, auto-parts-db) */
export function normalizeModelMatchKey(slugOrName: string): string {
  let m = slugOrName.toLowerCase().trim();
  m = m.replace(/\s*\([^)]*\)/g, "");
  m = m.replace(/-class(-van|-truck)?$/i, "");
  m = m.replace(/-(van|truck)$/i, "");

  const seriesNum = m.match(/(?:series\s*(\d+))|(?:(\d+)\s*-?\s*(?:er\s*)?reihe)|(?:(\d+)\s*series)/i);
  if (seriesNum) {
    const num = seriesNum[1] || seriesNum[2] || seriesNum[3];
    return `series${num}`;
  }

  m = m.replace(/[^a-z0-9]/g, "");
  if (m === "gclass" || m === "gclassvan" || m === "gvan" || m === "gtruck") return "g";
  return m;
}

export const PLACEHOLDER_IMAGE = "__pending__";
