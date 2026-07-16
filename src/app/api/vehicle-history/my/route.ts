import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listMyVehicleReports } from "@/modules/vehicle-history/history.service";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const rows = await listMyVehicleReports(session.id);
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      queryType: r.queryType,
      queryNorm: r.queryNorm,
      summary: JSON.parse(r.summaryJson),
      createdAt: r.createdAt,
    }))
  );
}
