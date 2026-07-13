import { brandToSlug } from "./car-catalog-utils";

export type AllowedBrand = {
  name: string;
  slug: string;
  aliases?: string[];
};

/** Только эти марки показываются в селекторе (как на Авито/Дром) */
const CYRILLIC_SLUGS: Record<string, string> = {
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

const ALLOWED_BRAND_NAMES = [
  "Abarth", "Acura", "AITO", "Aiways", "Alfa Romeo", "Alpina", "Alpine", "Ambertruck",
  "AMC", "Arcfox", "Aro", "Asia", "Aston Martin", "Audi", "Aurus", "Avatr", "Avia",
  "Avior", "BAIC", "Bajaj", "Baojun", "Barkas", "BAW", "Bedford", "Belgee", "Bentley",
  "Bestune", "BMW", "BNM", "Borgward", "Bremach", "Brilliance", "Bugatti", "Buick",
  "BYD", "Cadillac", "CAMC", "Changan", "Changfeng", "Changhe", "Chery", "Chevrolet",
  "Chrysler", "Ciimo", "Citroën", "Coda", "Cupra", "Dacia", "Dadi", "Daewoo", "DAF",
  "Daihatsu", "Daimler", "Datsun", "Dayun", "DeLorean", "Denza", "Derways", "Dodge",
  "Dongfeng", "Dorcen", "DW Hower", "Eagle", "Enovate", "Eonyx", "ERF", "Evolute",
  "Exeed", "Exlantix", "FAW", "Ferrari", "Fiat", "Ford", "Foton", "GMC", "Geely",
  "Genesis", "Great Wall", "Hafei", "Haima", "Haval", "Hawtai", "Honda", "Hongqi",
  "Hummer", "Hyundai", "Infiniti", "Iran Khodro", "Isuzu", "Iveco", "JAC", "Jaecoo",
  "Jaguar", "Jeep", "Jetour", "Jetta", "Kaiyi", "KGM", "Kia", "Knewstar", "Lada",
  "Lamborghini", "Lancia", "Land Rover", "LDV", "Leapmotor", "Lexus", "Li Auto",
  "Lifan", "Lincoln", "Livan", "Lotus", "Luxgen", "Lynk & Co", "MAN", "Maserati",
  "Maxus", "Maybach", "Mazda", "McLaren", "Mercedes-Benz", "Mercury", "MG", "MINI",
  "Mitsubishi", "Morgan", "Nissan", "NIO", "Omoda", "Opel", "Ora", "Oting", "Peugeot",
  "Plymouth", "Polestar", "Pontiac", "Porsche", "Proton", "RAM", "Ravon", "Renault",
  "Rivian", "Rolls-Royce", "Rover", "Rox", "Saab", "Saturn", "Scania", "Scion",
  "SEAT", "Smart", "Sollers", "Soueast", "SWM", "SsangYong", "Subaru", "Suzuki",
  "Tank", "Tata", "Tesla", "Toyota", "Volkswagen", "Volvo", "Voyah", "WEY", "Xcite",
  "Xiaomi", "Xpeng", "Zeekr", "Zotye", "ZX",
  "Автокам", "ВАЗ", "ВИС", "ГАЗ", "ЕрАЗ", "ЗАЗ", "ЗИЛ", "ИЖ", "КАМАЗ", "ЛиАЗ",
  "ЛуАЗ", "МАЗ", "Москвич", "НефАЗ", "ПАЗ", "RAF", "СеАЗ", "ТагАЗ", "УАЗ", "Урал",
] as const;

const SLUG_ALIASES: Record<string, string[]> = {
  lada: ["vaz", "ваз"],
  vaz: ["lada"],
  "mercedes-benz": ["mercedes"],
  mini: ["mini-cooper"],
  ssangyong: ["ssangyong"],
  citroen: ["citroën"],
  "land-rover": ["landrover"],
  "alfa-romeo": ["alfa"],
  "rolls-royce": ["rollsroyce"],
  "aston-martin": ["astonmartin"],
  "great-wall": ["greatwall", "gwm"],
  "lynk-co": ["lynkco"],
  "li-auto": ["liauto", "li"],
  "iran-khodro": ["ikco"],
  "dw-hower": ["hower"],
  moskvich: ["москвич"],
  uaz: ["уаз"],
  gaz: ["газ"],
  kamaz: ["камаз"],
  zaz: ["заз"],
  zil: ["зил"],
  izh: ["иж"],
  maz: ["маз"],
  tagaz: ["тагаз"],
  seaz: ["сеаз"],
  avtokam: ["автокам"],
  vis: ["вис"],
  eraz: ["ераз"],
  luaz: ["луаз"],
  liaz: ["лиаз"],
  nefaz: ["нефаз"],
  paz: ["паз"],
  ural: ["урал"],
};

export const ALLOWED_CAR_BRANDS: AllowedBrand[] = ALLOWED_BRAND_NAMES.map((name) => {
  const slug = CYRILLIC_SLUGS[name] ?? brandToSlug(name);
  return { name, slug, aliases: SLUG_ALIASES[slug] };
});

const slugSet = new Set<string>();
const nameKeySet = new Set<string>();

function normNameKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9а-яё]/gi, "");
}

for (const b of ALLOWED_CAR_BRANDS) {
  slugSet.add(b.slug);
  nameKeySet.add(normNameKey(b.name));
  for (const alias of b.aliases ?? []) {
    slugSet.add(alias);
    nameKeySet.add(normNameKey(alias));
  }
}

export const ALLOWED_BRAND_SLUGS = slugSet;

export function isAllowedBrandSlug(slug: string): boolean {
  const s = slug.toLowerCase().trim();
  if (ALLOWED_BRAND_SLUGS.has(s)) return true;
  const noHyphen = s.replace(/-/g, "");
  return ALLOWED_BRAND_SLUGS.has(noHyphen);
}

export function isAllowedBrandName(name: string): boolean {
  return nameKeySet.has(normNameKey(name));
}

export function filterAllowedBrands<T extends { slug: string; name: string }>(brands: T[]): T[] {
  return brands.filter((b) => isAllowedBrandSlug(b.slug) || isAllowedBrandName(b.name));
}

/** Популярные марки для Армении/СНГ — показываются сверху */
export const FEATURED_BRAND_SLUGS = [
  "toyota", "mercedes-benz", "bmw", "hyundai", "kia", "nissan", "honda", "lexus",
  "volkswagen", "audi", "ford", "chevrolet", "mazda", "mitsubishi", "subaru",
  "renault", "peugeot", "opel", "skoda", "citroen", "lada", "uaz", "gaz",
  "geely", "chery", "haval", "byd", "tesla", "porsche", "land-rover", "jeep",
  "infiniti", "genesis", "volvo", "jaguar", "mini", "ssangyong", "daewoo",
  "dacia", "fiat", "cupra", "seat", "suzuki", "isuzu", "daihatsu", "ram",
  "cadillac", "bentley", "ferrari", "lamborghini", "maserati", "rolls-royce",
];
