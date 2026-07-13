import type { CarDetails } from "@prisma/client";
import { fixMojibake } from "@/lib/text-encoding";
import { formatNumber } from "@/lib/utils";

export type CarListingExtras = {
  modification?: string;
  trim?: string;
  pts?: string;
  steeringWheel?: string;
  ecoClass?: string;
  sellerType?: "private" | "dealer" | "salon";
  options?: string[];
  bodyPaint?: string[];
  liquidityNote?: string;
};

const OPTION_LABELS: Record<string, string> = {
  leather: "Кожаный салон",
  heated_seats: "Подогрев сидений",
  electric_seats: "Электроприводы сидений",
  sunroof: "Люк / панорама",
  carplay: "Apple CarPlay",
  android_auto: "Android Auto",
  camera_360: "Камера 360°",
  cruise: "Круиз-контроль",
  parking_sensors: "Парктроники",
  keyless: "Бесключевой доступ",
  climate: "Климат-контроль",
  nav: "Навигация",
  xenon: "Ксенон / LED",
};

const BODY_PART_LABELS: Record<string, string> = {
  hood: "Капот",
  roof: "Крыша",
  trunk: "Багажник",
  door_fl: "Дверь ПП",
  door_fr: "Дверь ПЛ",
  door_rl: "Дверь ЗЛ",
  door_rr: "Дверь ЗП",
  fender_fl: "Крыло ПП",
  fender_fr: "Крыло ПЛ",
  bumper_f: "Бампер пер.",
  bumper_r: "Бампер зад.",
};

export function parseCarListingExtras(attributes: string | null | undefined): CarListingExtras {
  if (!attributes) return {};
  try {
    const raw = JSON.parse(attributes) as Record<string, unknown>;
    const car = (raw.car ?? raw) as Record<string, unknown>;
    return {
      modification: typeof car.modification === "string" ? car.modification : undefined,
      trim: typeof car.trim === "string" ? car.trim : undefined,
      pts: typeof car.pts === "string" ? car.pts : undefined,
      steeringWheel: typeof car.steeringWheel === "string" ? car.steeringWheel : undefined,
      ecoClass: typeof car.ecoClass === "string" ? car.ecoClass : undefined,
      sellerType:
        car.sellerType === "dealer" || car.sellerType === "salon" || car.sellerType === "private"
          ? car.sellerType
          : undefined,
      options: Array.isArray(car.options) ? car.options.map(String) : undefined,
      bodyPaint: Array.isArray(car.bodyPaint) ? car.bodyPaint.map(String) : undefined,
      liquidityNote: typeof car.liquidityNote === "string" ? car.liquidityNote : undefined,
    };
  } catch {
    return {};
  }
}

export function buildCarListingTitle(car: CarDetails, extras: CarListingExtras, fallbackTitle: string) {
  const mod = extras.modification?.trim();
  const base = mod
    ? `${car.brand} ${car.model}, ${mod}, ${car.year}`
    : `${car.brand} ${car.model}, ${car.year}`;
  return fixMojibake(base || fallbackTitle);
}

export function buildCarSubtitleChips(car: CarDetails) {
  const chips: string[] = [];
  chips.push(`${formatNumber(car.mileage)} км`);
  chips.push(String(car.year));
  if (car.engineType) chips.push(car.engineType);
  if (car.driveType) chips.push(car.driveType);
  if (car.transmission) chips.push(car.transmission);
  return chips;
}

export function getOptionLabel(key: string) {
  return OPTION_LABELS[key] ?? key;
}

export function getBodyPartLabel(key: string) {
  return BODY_PART_LABELS[key] ?? key;
}

export const SELLER_TYPE_LABELS: Record<string, string> = {
  private: "Частное лицо",
  dealer: "Дилер",
  salon: "Автосалон",
};

export { OPTION_LABELS, BODY_PART_LABELS };
