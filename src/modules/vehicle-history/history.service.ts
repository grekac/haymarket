import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { buildHistoryPayload } from "./providers";
import { normalizeQuery, type VehicleQueryType } from "./normalize";

function hashIp(ip?: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function createVehicleHistoryReport(input: {
  query: string;
  type?: VehicleQueryType;
  userId?: string | null;
  listingId?: string | null;
  ip?: string | null;
}) {
  const { type, normalized, fingerprint } = normalizeQuery(input.query, input.type);

  // Reuse fresh report (24h) for same fingerprint
  const existing = await prisma.vehicleHistoryReport.findFirst({
    where: {
      fingerprint,
      status: "READY",
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
