import type { RealEstateDetails } from "@prisma/client";
import { PROPERTY_TYPES } from "@/lib/utils";
import {
  formatAttributeValue,
  getCategoryFieldGroups,
  parseAttributes,
  type CategoryFieldGroup,
} from "@/lib/category-fields";
import { parseRealEstateExtras } from "@/lib/real-estate-extra";

export type SpecRow = { label: string; value: string };
export type SpecSection = { title: string; entries: SpecRow[] };

function row(label: string, value: unknown): SpecRow | null {
  if (value == null || value === "" || value === false) return null;
  const formatted =
    typeof value === "boolean"
      ? value
        ? "Да"
        : "Нет"
      : formatAttributeValue(label, value) || String(value);
  if (!formatted) return null;
  return { label, value: formatted };
}

function compact(rows: (SpecRow | null)[]): SpecRow[] {
  return rows.filter((r): r is SpecRow => r != null);
}

export function buildRealEstateSpecSections(
  realEstate: RealEstateDetails,
  attributes: string | null | undefined,
  conditionLabel: string
): SpecSection[] {
  const extras = parseRealEstateExtras(attributes);
  const propertyLabel =
    PROPERTY_TYPES.find((t) => t.value === realEstate.propertyType)?.label ??
    realEstate.propertyType;

  const isResidential =
    realEstate.propertyType === "APARTMENT" || realEstate.propertyType === "HOUSE";
  const isCommercial = realEstate.propertyType === "COMMERCIAL";
  const isLand = realEstate.propertyType === "LAND";

  const main: SpecRow[] = compact([
    row("Сделка", formatAttributeValue("dealType", realEstate.dealType)),
    row("Тип", propertyLabel),
    extras.commercialSubtype
      ? row("Подтип", formatAttributeValue("commercialSubtype", extras.commercialSubtype))
      : null,
    row("Площадь", `${realEstate.area} м²`),
    isResidential ? row("Жилая площадь", extras.livingArea ? `${extras.livingArea} м²` : "") : null,
    isResidential ? row("Кухня", extras.kitchenArea ? `${extras.kitchenArea} м²` : "") : null,
    isResidential && realEstate.rooms ? row("Комнаты", String(realEstate.rooms)) : null,
    isResidential && realEstate.floor != null
      ? row(
          "Этаж",
          `${realEstate.floor}${realEstate.totalFloors ? ` / ${realEstate.totalFloors}` : ""}`
        )
      : null,
    isLand ? row("Назначение", extras.landPurpose) : null,
    isCommercial ? row("Назначение", extras.commercialPurpose) : null,
    realEstate.buildingYear ? row("Год постройки", String(realEstate.buildingYear)) : null,
    extras.buildingMaterial ? row("Материал дома", extras.buildingMaterial) : null,
    realEstate.renovationType
      ? row("Ремонт", formatAttributeValue("renovationType", realEstate.renovationType))
      : null,
    realEstate.heating ? row("Отопление", formatAttributeValue("heating", realEstate.heating)) : null,
    extras.airConditioning ? row("Кондиционер", "Есть") : null,
    realEstate.balcony ? row("Балкон", formatAttributeValue("balcony", realEstate.balcony)) : null,
    realEstate.bathrooms ? row("Санузлов", String(realEstate.bathrooms)) : null,
    realEstate.furniture ? row("Мебель", "Есть") : null,
    realEstate.parking ? row("Парковка", "Есть") : null,
    extras.ceilingHeight ? row("Высота потолков", `${extras.ceilingHeight} м`) : null,
    row("Состояние", conditionLabel),
  ]);

  return [{ title: "Недвижимость", entries: main }];
}

const HIDDEN_SPEC_KEYS: Record<string, string[]> = {
  jobs: ["duties", "requirements", "conditions", "skills", "education", "portfolio"],
  services: ["portfolioNote"],
};

export function buildAttributeSpecSections(
  categorySlug: string,
  attributes: string | null | undefined,
  conditionLabel: string,
  groups?: CategoryFieldGroup[],
  sectionTitle?: string
): SpecSection[] {
  const attrs = parseAttributes(attributes);
  const hidden = new Set(HIDDEN_SPEC_KEYS[categorySlug] ?? []);
  const entries = (groups
    ? getAttributeDisplayEntriesFromGroups(groups, attrs, hidden)
    : getAttributeDisplayEntriesFiltered(categorySlug, attrs, hidden)
  );

  if (!entries.length) {
    return [{ title: sectionTitle ?? "Характеристики", entries: [{ label: "Состояние", value: conditionLabel }] }];
  }

  return [
    {
      title: sectionTitle ?? resolveSectionTitle(categorySlug, attrs),
      entries: [{ label: "Состояние", value: conditionLabel }, ...entries],
    },
  ];
}

function getAttributeDisplayEntriesFiltered(
  slug: string,
  attrs: Record<string, unknown>,
  hidden: Set<string>
) {
  const groups = getCategoryFieldGroups(slug);
  return getAttributeDisplayEntriesFromGroups(groups, attrs, hidden);
}

function getAttributeDisplayEntriesFromGroups(
  groups: CategoryFieldGroup[],
  attrs: Record<string, unknown>,
  hidden: Set<string> = new Set()
) {
  const entries: { label: string; value: string }[] = [];
  for (const group of groups) {
    for (const field of group.fields) {
      if (hidden.has(field.key)) continue;
      const val = attrs[field.key];
      if (val == null || val === "" || val === false) continue;
      const formatted = formatAttributeValue(field.key, val);
      if (!formatted) continue;
      entries.push({ label: field.label, value: formatted });
    }
  }
  return entries;
}

function resolveSectionTitle(slug: string, attrs: Record<string, unknown>) {
  if (slug === "jobs") {
    return attrs.listingType === "resume" ? "Соискатель" : "Вакансия";
  }
  if (slug === "electronics") return "Электроника";
  if (slug === "services") return "Услуга";
  if (slug === "car-parts") return "Запчасти";
  if (slug === "animals") return "Животное";
  return "Характеристики";
}

export function buildListingChips(
  categorySlug: string,
  attributes: string | null | undefined,
  realEstate?: RealEstateDetails | null
): string[] {
  const attrs = parseAttributes(attributes);
  const chips: string[] = [];

  if (realEstate) {
    chips.push(formatAttributeValue("dealType", realEstate.dealType));
    const pt = PROPERTY_TYPES.find((t) => t.value === realEstate.propertyType)?.label;
    if (pt) chips.push(pt);
    if (realEstate.rooms) chips.push(`${realEstate.rooms} комн.`);
    chips.push(`${realEstate.area} м²`);
    if (realEstate.floor != null) {
      chips.push(
        `эт. ${realEstate.floor}${realEstate.totalFloors ? `/${realEstate.totalFloors}` : ""}`
      );
    }
    return chips.filter(Boolean);
  }

  const chipKeys: Record<string, string[]> = {
    electronics: ["subcategory", "brand", "storage", "ram"],
    jobs: ["listingType", "employmentType", "schedule"],
    services: ["serviceType", "priceType"],
    clothing: ["clothingType", "size", "brand"],
    animals: ["animalType", "breed", "age"],
    "car-parts": ["partType", "brand"],
    trucks: ["vehicleType", "year"],
    "machinery-rental": ["equipmentType"],
    motorcycles: ["motoType", "brand"],
    "water-transport": ["waterType", "length"],
    "home-furniture": ["itemType", "material"],
    kids: ["itemType", "ageGroup"],
  };

  for (const key of chipKeys[categorySlug] ?? []) {
    const val = attrs[key];
    if (val == null || val === "" || val === false) continue;
    const formatted = formatAttributeValue(key, val);
    if (formatted) chips.push(formatted);
  }

  return chips;
}
