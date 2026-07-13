import { NextResponse } from "next/server";
import { getHealthReport } from "@/lib/health";

/** Render health check — всегда HTTP 200, иначе деплой падает */
export async function GET() {
  const report = await getHealthReport();
  return NextResponse.json(report);
}
