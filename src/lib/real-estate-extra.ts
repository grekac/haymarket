import { parseAttributes } from "@/lib/category-fields";

export type RealEstateExtras = {
  livingArea?: number;
  kitchenArea?: number;
  buildingMaterial?: string;
  airConditioning?: boolean;
  ceilingHeight?: number;
  commercialSubtype?: string;
  commercialPurpose?: string;
  landPurpose?: string;
};

const COMMERCIAL_SUBTYPE_LABELS: Record<string, string> = {
  office: "Офис",
  warehouse: "Склад",
  garage: "Гараж",
  retail: "Торговое помещение",
  production: "Производство",
  other: "Другое",
};

export function parseRealEstateExtras(attributes: string | null | undefined): RealEstateExtras {
  if (!attributes) return {};
  try {
    const raw = JSON.parse(attributes) as Record<string, unknown>;
    const re = (raw.realEstate ?? raw) as Record<string, unknown>;
    return {
      livingArea: typeof re.livingArea === "number" ? re.livingArea : undefined,
      kitchenArea: typeof re.kitchenArea === "number" ? re.kitchenArea : undefined,
      buildingMaterial: typeof re.buildingMaterial === "string" ? re.buildingMaterial : undefined,
      airConditioning: re.airConditioning === true,
      ceilingHeight: typeof re.ceilingHeight === "number" ? re.ceilingHeight : undefined,
      commercialSubtype:
        typeof re.commercialSubtype === "string" ? re.commercialSubtype : undefined,
      commercialPurpose:
        typeof re.commercialPurpose === "string" ? re.commercialPurpose : undefined,
      landPurpose: typeof re.landPurpose === "string" ? re.landPurpose : undefined,
    };
  } catch {
    return {};
  }
}

export function commercialSubtypeLabel(value?: string) {
  if (!value) return "";
  return COMMERCIAL_SUBTYPE_LABELS[value] ?? value;
}

export function collectRealEstateExtrasFromForm(fd: FormData): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  const numKeys = ["livingArea", "kitchenArea", "ceilingHeight"] as const;
  for (const key of numKeys) {
    const raw = fd.get(`re_${key}`);
    if (raw && raw !== "") extras[key] = Number(raw);
  }
  const strKeys = ["buildingMaterial", "commercialSubtype", "commercialPurpose", "landPurpose"] as const;
  for (const key of strKeys) {
    const raw = fd.get(`re_${key}`);
    if (raw && raw !== "") extras[key] = String(raw).trim();
  }
  if (fd.get("re_airConditioning") === "on") extras.airConditioning = true;
  return Object.keys(extras).length ? { realEstate: extras } : {};
}

export function mergeRealEstateAttributes(
  existing: string | null | undefined,
  extras: Record<string, unknown>
): string | null {
  const base = parseAttributes(existing);
  const merged = { ...base, ...extras };
  return Object.keys(merged).length ? JSON.stringify(merged) : null;
}