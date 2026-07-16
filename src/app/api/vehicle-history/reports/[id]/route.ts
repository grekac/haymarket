import { NextResponse } from "next/server";
import { getVehicleHistoryReport } from "@/modules/vehicle-history/history.service";

type Params = Promise<{ id: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const report = await getVehicleHistoryReport(id);
  if (!report || report.status !== "READY") {
    return NextResponse.json({ error: "Отчёт не найден" }, { status: 404 });
  }
  return NextResponse.json({
    id: report.id,
    queryType: report.queryType,
    queryNorm: report.queryNorm,
    paymentStatus: report.paymentStatus,
    summary: JSON.parse(report.summaryJson),
    payload: JSON.parse(report.payloadJson),
    createdAt: report.createdAt,
  });
}
