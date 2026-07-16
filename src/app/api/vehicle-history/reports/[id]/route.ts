import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getVehicleHistoryReport,
  toViewerPayload,
} from "@/modules/vehicle-history/history.service";

type Params = Promise<{ id: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const report = await getVehicleHistoryReport(id);
  if (!report || report.status !== "READY") {
    return NextResponse.json({ error: "Отчёт не найден" }, { status: 404 });
  }

  const session = await getSession();
  const { payload, viewerPaymentStatus } = toViewerPayload(
    report,
    session?.id ?? null
  );

  return NextResponse.json({
    id: report.id,
    queryType: report.queryType,
    queryNorm: report.queryNorm,
    paymentStatus: viewerPaymentStatus,
    summary: JSON.parse(report.summaryJson),
    payload,
    createdAt: report.createdAt,
  });
}
