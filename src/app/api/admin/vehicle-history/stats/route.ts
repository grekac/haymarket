import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [lookupsTotal, lookupsLast24h, reportsTotal, reportsPaid, partnerKeysActive] =
    await Promise.all([
      prisma.vehicleHistoryLookup.count(),
      prisma.vehicleHistoryLookup.count({ where: { createdAt: { gte: since } } }),
      prisma.vehicleHistoryReport.count(),
      prisma.vehicleHistoryReport.count({ where: { paymentStatus: "PAID" } }),
      prisma.vehicleHistoryPartnerKey.count({ where: { isActive: true } }),
    ]);

  return NextResponse.json({
    lookupsTotal,
    lookupsLast24h,
    reportsTotal,
    reportsPaid,
    partnerKeysActive,
  });
}
