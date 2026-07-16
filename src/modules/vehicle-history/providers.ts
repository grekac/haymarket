import { prisma } from "@/lib/prisma";
import {
  decodeVinBasic,
  normalizeQuery,
  type HistoryPayload,
  type ReportSection,
  type VehicleQueryType,
} from "./normalize";

export type ProviderResult = {
  vehicle?: HistoryPayload["vehicle"];
  sections: ReportSection[];
};

export interface VehicleHistoryProvider {
  id: string;
  fetch(input: {
    type: VehicleQueryType;
    normalized: string;
    raw: string;
  }): Promise<ProviderResult>;
}

/** Live: VIN WMI decode */
export const vinDecoderProvider: VehicleHistoryProvider = {
  id: "vin-decoder",
  async fetch({ type, normalized }) {
    if (type !== "VIN") return { sections: [] };
    const vehicle = decodeVinBasic(normalized);
    const items = [
      vehicle.make ? { label: "Марка (WMI)", value: vehicle.make } : null,
      vehicle.year ? { label: "Модельный год (approx.)", value: String(vehicle.year) } : null,
      vehicle.wmi ? { label: "WMI", value: vehicle.wmi } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    return {
      vehicle,
      sections: [
        {
          id: "identity",
          title: "Идентификация ТС",
          status: items.length ? "partial" : "unavailable",
          source: "vin-decoder",
          summary: items.length
            ? "Базовая расшифровка VIN (не заменяет официальный отчёт)."
            : "Не удалось расшифровать VIN.",
          items,
        },
      ],
    };
  },
};

/** Strip spaces/punctuation so "12 AB 345" matches normalized "12AB345". */
function stripAlnum(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Insert spaces at digit↔letter boundaries: 12AB345 → "12 AB 345". */
function spacedAlnumVariant(normalized: string): string | null {
  const spaced = normalized.replace(/(?<=\d)(?=[A-Z])|(?<=[A-Z])(?=\d)/g, " ");
  return spaced !== normalized ? spaced : null;
}

/** Live: search HayMarket listings by VIN / plate in carDetails + attributes */
export const haymarketInternalProvider: VehicleHistoryProvider = {
  id: "haymarket-internal",
  async fetch({ type, normalized }) {
    // Plate may live only in attributes JSON (CarDetails has no plate field).
    // Spaced values like "12 AB 345" won't match contains(normalized); try spaced form too.
    const isPlate = type === "PLATE";
    const spacedPlate = isPlate ? spacedAlnumVariant(normalized) : null;

    const attributeOr = isPlate
      ? [
          { attributes: { contains: normalized } },
          ...(spacedPlate ? [{ attributes: { contains: spacedPlate } }] : []),
        ]
      : [{ attributes: { contains: normalized } }];

    const candidates = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { carDetails: { is: { vin: { equals: normalized, mode: "insensitive" as const } } } },
          ...attributeOr,
          // VIN may appear in title; plates must not match via title substring.
          ...(isPlate ? [] : [{ title: { contains: normalized, mode: "insensitive" as const } }]),
        ],
      },
      take: isPlate ? 100 : 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        city: true,
        status: true,
        createdAt: true,
        attributes: true,
        carDetails: { select: { mileage: true, year: true, brand: true, model: true, vin: true } },
      },
    });

    const listings = isPlate
      ? candidates.filter((l) => {
          if (l.carDetails?.vin && stripAlnum(l.carDetails.vin) === normalized) return true;
          if (l.attributes && stripAlnum(l.attributes).includes(normalized)) return true;
          return false;
        })
      : candidates;

    const items = listings.map((l) => ({
      label: `${l.carDetails?.brand ?? ""} ${l.carDetails?.model ?? ""} · ${l.city}`.trim(),
      value: `${l.status} · ${l.carDetails?.mileage != null ? `${l.carDetails.mileage} км` : "—"} · ${new Date(l.createdAt).toLocaleDateString("ru-RU")}`,
    }));

    return {
      sections: [
        {
          id: "marketplace",
          title: "История на HayMarket",
          status: items.length ? "verified" : "unavailable",
          source: "haymarket-internal",
          summary: items.length
            ? `Найдено объявлений: ${items.length}`
            : "На HayMarket пока нет совпадений по этому идентификатору.",
          items,
        },
        {
          id: "mileage",
          title: "Пробег (по объявлениям)",
          status: listings.some((l) => l.carDetails?.mileage != null) ? "partial" : "unavailable",
          source: "haymarket-internal",
          summary: "Оценка по публичным объявлениям, не одометр официальный.",
          items: listings
            .filter((l) => l.carDetails?.mileage != null)
            .map((l) => ({
              label: new Date(l.createdAt).toLocaleDateString("ru-RU"),
              value: `${l.carDetails!.mileage} км`,
            })),
        },
      ],
    };
  },
};

/**
 * Planned B2B adapters for Armenia — return explicit unavailable until contracts exist.
 * Do NOT fabricate accidents / wanted hits.
 */
function plannedUnavailable(id: string, title: string, source: string, reason: string): ReportSection {
  return {
    id,
    title,
    status: "unavailable",
    source,
    summary: reason,
    items: [],
  };
}

export const armeniaPlannedProviders: VehicleHistoryProvider = {
  id: "armenia-planned",
  async fetch() {
    return {
      sections: [
        plannedUnavailable(
          "owners",
          "Владельцы",
          "traffic-police-am (planned)",
          "Нужен B2B-доступ к реестру регистрации ТС РА. Модуль готов к подключению."
        ),
        plannedUnavailable(
          "accidents",
          "ДТП",
          "insurance-bureau-am (planned)",
          "Планируется интеграция со страховым бюро / агрегаторами убытков по договору."
        ),
        plannedUnavailable(
          "restrictions",
          "Ограничения и залоги",
          "customs-legal-am (planned)",
          "Ограничения, залог, арест — через уполномоченных партнёров / нотариальные реестры."
        ),
        plannedUnavailable(
          "wanted",
          "Розыск",
          "traffic-police-am (planned)",
          "Проверка розыска только после официального API/шлюза партнёра."
        ),
        plannedUnavailable(
          "inspection",
          "Техосмотр",
          "inspection-am (planned)",
          "Данные ТО появятся после соглашения с оператором техосмотра."
        ),
        plannedUnavailable(
          "insurance",
          "Страхование",
          "insurance-bureau-am (planned)",
          "Полисы ОСАГО/КАСКО — через страховых партнёров."
        ),
      ],
    };
  },
};

export async function buildHistoryPayload(raw: string, typeHint?: VehicleQueryType): Promise<HistoryPayload> {
  const { type, normalized, fingerprint } = normalizeQuery(raw, typeHint);
  void fingerprint;

  const providers = [vinDecoderProvider, haymarketInternalProvider, armeniaPlannedProviders];
  const results = await Promise.all(providers.map((p) => p.fetch({ type, normalized, raw })));

  const vehicle = results.reduce<HistoryPayload["vehicle"]>((acc, r) => ({ ...acc, ...r.vehicle }), {});
  const sections = results.flatMap((r) => r.sections);

  return {
    query: { type, value: raw.trim(), normalized },
    vehicle,
    sections,
    disclaimers: [
      "Отчёт HayPass — продукт HayMarket. Секции без договора с источником помечены как unavailable.",
      "Расшифровка VIN приблизительная и не является экспертизой.",
      "Не используйте отчёт как единственное основание для сделки — проверьте авто офлайн.",
    ],
    generatedAt: new Date().toISOString(),
  };
}
