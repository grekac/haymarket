import { NextResponse } from "next/server";
import { getHealthReport } from "@/lib/health";

/** Глубокая проверка для мониторинга (UptimeRobot, Better Stack) — 503 если БД недоступна */
export async function GET() {
  const report = await getHealthReport();
  return NextResponse.json(report, { status: report.ok ? 200 : 503 });
}
