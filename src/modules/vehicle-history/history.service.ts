import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { buildHistoryPayload } from "./providers";
import {
  normalizeQuery,
  type HistoryPayload,
  type ReportSection,
  type VehicleQueryType,
} from "./normalize";

function hashIp(ip?: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

const REGISTRY_NOTE =
  "Официальные реестры Армении пока не подключены. Секция — чеклист готовности, не результат проверки.";

function enrichmentSection(
  id: string,
  title: string,
  status: ReportSection["status"],
  summary: string,
  items: ReportSection["items"] = []
): ReportSection {
  return {
    id,
    title,
    status,
    source: "haypass-paid-enrichment",
    summary,
    items,
  };
}

/** Honest paid enrichment — never invents verified accidents/owners. */
export function buildPaidEnrichmentSections(packageId: "basic" | "full"): ReportSection[] {
  const basic: ReportSection[] = [
    enrichmentSection(
      "enrich-registries",
      "Реестры РА (статус подключения)",
      "partial",
      REGISTRY_NOTE,
      [
        { label: "ГАИ / регистрация ТС", value: "не подключено" },
        { label: "Страховое бюро", value: "не подключено" },
        { label: "Таможня / залоги", value: "не подключено" },
      ]
    ),
    enrichmentSection(
      "enrich-accidents",
      "ДТП — расширенная проверка",
      "unavailable",
      `${REGISTRY_NOTE} Без договора со страховым бюро статусы ДТП недоступны.`
    ),
    enrichmentSection(
      "enrich-owners",
      "Владельцы — цепочка регистрации",
      "unavailable",
      `${REGISTRY_NOTE} История владельцев появится после B2B-доступа к реестру.`
    ),
  ];

  if (packageId === "basic") return basic;

  return [
    ...basic,
    enrichmentSection(
      "enrich-restrictions",
      "Ограничения и залоги (чеклист)",
      "unavailable",
      `${REGISTRY_NOTE} Проверка ареста/залога — после партнёрского шлюза.`
    ),
    enrichmentSection(
      "enrich-wanted",
      "Розыск (чеклист)",
      "unavailable",
      `${REGISTRY_NOTE} Розыск проверяется только через официальный API.`
    ),
    enrichmentSection(
      "enrich-customs",
      "Импорт / таможня (чеклист)",
      "unavailable",
      `${REGISTRY_NOTE} Таможенная история недоступна до интеграции.`
    ),
    enrichmentSection(
      "enrich-insurance",
      "Страхование (чеклист)",
      "unavailable",
      `${REGISTRY_NOTE} Полисы ОСАГО/КАСКО — через страховых партнёров.`
    ),
    enrichmentSection(
      "enrich-inspection",
      "Техосмотр (чеклист)",
      "unavailable",
      `${REGISTRY_NOTE} Данные ТО появятся после соглашения с оператором.`
    ),
  ];
}

export function mergePaidEnrichment(
  payload: HistoryPayload,
  packageId: "basic" | "full"
): HistoryPayload {
  const enrichment = buildPaidEnrichmentSections(packageId);
  const enrichIds = new Set(enrichment.map((s) => s.id));
  const kept = payload.sections.filter((s) => !enrichIds.has(s.id));
  const disclaimer =
    "Платный unlock: официальные реестры Армении ещё не подключены — без выдуманных verified ДТП/владельцев.";

  return {
    ...payload,
    sections: [...kept, ...enrichment],
    disclaimers: payload.disclaimers.includes(disclaimer)
      ? payload.disclaimers
      : [...payload.disclaimers, disclaimer],
    generatedAt: new Date().toISOString(),
  };
}

function isPaidEnrichmentSection(section: ReportSection) {
  return (
    section.id.startsWith("enrich-") ||
    (typeof section.source === "string" && section.source.includes("paid-unlock"))
  );
}

export type ViewerPaymentStatus = "FREE" | "UNPAID" | "PAID";

/**
 * Viewer-safe payload + UI payment status: paid enrichment / PAID badge
 * only for the owning payer. Non-owners of a PAID report see FREE (unlock CTA).
 */
export function toViewerPayload(
  report: { paymentStatus: string; userId: string | null; payloadJson: string },
  viewerUserId: string | null
): { payload: HistoryPayload; viewerPaymentStatus: ViewerPaymentStatus } {
  const payload = JSON.parse(report.payloadJson) as HistoryPayload;
  const canSeePaid =
    report.paymentStatus === "PAID" &&
    viewerUserId != null &&
    viewerUserId === report.userId;

  const viewerPaymentStatus: ViewerPaymentStatus = canSeePaid
    ? "PAID"
    : report.paymentStatus === "PAID"
      ? "FREE"
      : report.paymentStatus === "UNPAID"
        ? "UNPAID"
        : "FREE";

  if (canSeePaid) return { payload, viewerPaymentStatus };

  return {
    payload: {
      ...payload,
      sections: payload.sections.filter((s) => !isPaidEnrichmentSection(s)),
    },
    viewerPaymentStatus,
  };
}

export async function createVehicleHistoryReport(input: {
  query: string;
  type?: VehicleQueryType;
  userId?: string | null;
  listingId?: string | null;
  ip?: string | null;
}) {
  const { type, normalized, fingerprint } = normalizeQuery(input.query, input.type);

  // Reuse fresh FREE report (24h) for same fingerprint — never reuse PAID
  const existing = await prisma.vehicleHistoryReport.findFirst({
    where: {
      fingerprint,
      status: "READY",
      paymentStatus: "FREE",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await prisma.vehicleHistoryLookup.create({
      data: {
        queryType: type,
        queryRaw: input.query.trim(),
        queryNorm: normalized,
        fingerprint,
        userId: input.userId || null,
        listingId: input.listingId || null,
        ipHash: hashIp(input.ip),
        reportId: existing.id,
      },
    });
    await prisma.vehicleHistoryAuditLog.create({
      data: {
        action: "lookup_cache_hit",
        actorId: input.userId || null,
        metaJson: JSON.stringify({ fingerprint, reportId: existing.id }),
      },
    });
    return existing;
  }

  const payload = await buildHistoryPayload(input.query, type);
  const summary = {
    make: payload.vehicle.make ?? null,
    model: payload.vehicle.model ?? null,
    year: payload.vehicle.year ?? null,
    sectionStatuses: Object.fromEntries(payload.sections.map((s) => [s.id, s.status])),
  };

  const report = await prisma.vehicleHistoryReport.create({
    data: {
      fingerprint,
      queryType: type,
      queryNorm: normalized,
      status: "READY",
      paymentStatus: "FREE",
      summaryJson: JSON.stringify(summary),
      payloadJson: JSON.stringify(payload),
      userId: input.userId || null,
      listingId: input.listingId || null,
    },
  });

  await prisma.vehicleHistoryLookup.create({
    data: {
      queryType: type,
      queryRaw: input.query.trim(),
      queryNorm: normalized,
      fingerprint,
      userId: input.userId || null,
      listingId: input.listingId || null,
      ipHash: hashIp(input.ip),
      reportId: report.id,
    },
  });

  await prisma.vehicleHistoryAuditLog.create({
    data: {
      action: "lookup_created",
      actorId: input.userId || null,
      metaJson: JSON.stringify({ fingerprint, reportId: report.id, type }),
    },
  });

  return report;
}

export async function getVehicleHistoryReport(id: string) {
  return prisma.vehicleHistoryReport.findUnique({ where: { id } });
}

export async function listMyVehicleReports(userId: string) {
  return prisma.vehicleHistoryReport.findMany({
    where: {
      OR: [{ userId }, { lookups: { some: { userId } } }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    distinct: ["id"],
  });
}
