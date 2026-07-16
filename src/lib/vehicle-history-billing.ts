import { prisma } from "@/lib/prisma";
import { getStripe, isStripeEnabled } from "@/lib/stripe-promotion";
import {
  mergePaidEnrichment,
} from "@/modules/vehicle-history/history.service";
import type { HistoryPayload } from "@/modules/vehicle-history/normalize";

export { isStripeEnabled };

export const VEHICLE_HISTORY_PACKAGES = {
  basic: {
    id: "basic" as const,
    amount: 990,
    currency: "AMD",
    label: "Базовый отчёт",
  },
  full: {
    id: "full" as const,
    amount: 2490,
    currency: "AMD",
    label: "Полный отчёт",
  },
} as const;

export type VehicleHistoryPackageId = keyof typeof VEHICLE_HISTORY_PACKAGES;

export function getPackages() {
  return Object.values(VEHICLE_HISTORY_PACKAGES);
}

export function getVehicleHistoryPackage(id: string) {
  return VEHICLE_HISTORY_PACKAGES[id as VehicleHistoryPackageId] ?? null;
}

function appBaseUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return base.startsWith("http") ? base.replace(/\/$/, "") : `https://${base}`;
}

function summarizePayload(payload: HistoryPayload) {
  return {
    make: payload.vehicle.make ?? null,
    model: payload.vehicle.model ?? null,
    year: payload.vehicle.year ?? null,
    sectionStatuses: Object.fromEntries(payload.sections.map((s) => [s.id, s.status])),
  };
}

/**
 * Shared unlock path for demo pay and Stripe fulfill.
 * Requires auth (userId). Idempotent if already PAID.
 */
export async function applyPaidUnlock(
  reportId: string,
  opts: { userId: string; packageId: string }
) {
  if (!opts.userId) throw new Error("Authentication required");

  const pkg = getVehicleHistoryPackage(opts.packageId);
  if (!pkg) throw new Error("Invalid package");

  const report = await prisma.vehicleHistoryReport.findUnique({
    where: { id: reportId },
  });
  if (!report) throw new Error("Report not found");

  if (report.userId && report.userId !== opts.userId) {
    throw new Error("Forbidden");
  }

  if (report.paymentStatus === "PAID") {
    return report;
  }

  const payload = JSON.parse(report.payloadJson) as HistoryPayload;
  const enriched = mergePaidEnrichment(payload, pkg.id);
  const summary = summarizePayload(enriched);

  const updated = await prisma.vehicleHistoryReport.update({
    where: { id: reportId },
    data: {
      paymentStatus: "PAID",
      paidPackage: pkg.id,
      userId: report.userId ?? opts.userId,
      payloadJson: JSON.stringify(enriched),
      summaryJson: JSON.stringify(summary),
    },
  });

  await prisma.vehicleHistoryAuditLog.create({
    data: {
      action: "report_paid_unlock",
      actorId: opts.userId,
      metaJson: JSON.stringify({
        reportId,
        packageId: pkg.id,
        amount: pkg.amount,
      }),
    },
  });

  return updated;
}

export async function createVehicleHistoryCheckout(opts: {
  reportId: string;
  userId: string;
  packageId: VehicleHistoryPackageId | string;
  locale?: string;
}) {
  if (!opts.userId) throw new Error("Authentication required");

  const pkg = getVehicleHistoryPackage(opts.packageId);
  if (!pkg) throw new Error("Invalid package");

  const report = await prisma.vehicleHistoryReport.findUnique({
    where: { id: opts.reportId },
  });
  if (!report) throw new Error("Report not found");

  if (report.userId && report.userId !== opts.userId) {
    throw new Error("Forbidden");
  }

  if (report.paymentStatus === "PAID") {
    throw new Error("Report already paid");
  }

  // Demo unlock (no STRIPE_SECRET_KEY): call applyPaidUnlock from the route, like promote.
  const stripe = getStripe();
  const locale = opts.locale === "ru" ? "ru" : "hy";
  const base = appBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "amd",
          unit_amount: pkg.amount,
          product_data: {
            name: `HayPass · ${pkg.label}`,
            description: `Отчёт ${report.queryNorm}`.slice(0, 120),
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "vehicle_history",
      reportId: opts.reportId,
      userId: opts.userId,
      packageId: pkg.id,
    },
    success_url: `${base}/${locale}/vehicle-history/report/${opts.reportId}?paid=success`,
    cancel_url: `${base}/${locale}/vehicle-history/report/${opts.reportId}?paid=cancel`,
  });

  // Do not set userId until payment succeeds (applyPaidUnlock).
  await prisma.vehicleHistoryReport.update({
    where: { id: opts.reportId },
    data: {
      stripeSessionId: session.id,
      paidPackage: pkg.id,
    },
  });

  return {
    reportId: opts.reportId,
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

export async function fulfillVehicleHistoryBySessionId(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return null;
  }

  const meta = session.metadata ?? {};
  // Prefer metadata.reportId so older sessions still fulfill if stripeSessionId was overwritten.
  let report = meta.reportId
    ? await prisma.vehicleHistoryReport.findUnique({ where: { id: meta.reportId } })
    : null;

  if (!report) {
    report = await prisma.vehicleHistoryReport.findUnique({
      where: { stripeSessionId: sessionId },
    });
  }

  if (!report) return null;

  if (report.paymentStatus === "PAID") {
    return report;
  }

  const userId = meta.userId || report.userId;
  const packageId = meta.packageId || report.paidPackage || "full";

  if (!userId) throw new Error("Missing userId for vehicle history fulfill");

  return applyPaidUnlock(report.id, { userId, packageId });
}
