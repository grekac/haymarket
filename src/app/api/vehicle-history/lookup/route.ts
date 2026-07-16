import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createVehicleHistoryReport } from "@/modules/vehicle-history/history.service";
import type { VehicleQueryType } from "@/modules/vehicle-history/normalize";

const VALID_TYPES = new Set(["VIN", "PLATE", "CHASSIS"]);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const query = String(body.query || "").trim();
    if (query.length < 5) {
      return NextResponse.json({ error: "Введите VIN, госномер или номер кузова" }, { status: 400 });
    }
    if (query.length > 64) {
      return NextResponse.json({ error: "Запрос слишком длинный" }, { status: 400 });
    }

    const typeRaw = body.type;
    if (typeRaw != null && typeRaw !== "") {
      if (!VALID_TYPES.has(String(typeRaw))) {
        return NextResponse.json(
          { error: "type must be VIN, PLATE, or CHASSIS" },
          { status: 400 },
        );
      }
    }
    const type =
      typeRaw != null && typeRaw !== ""
        ? (String(typeRaw) as VehicleQueryType)
        : undefined;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const allowed = await rateLimit(`vh:lookup:${session?.id || ip}`, 20, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Слишком много запросов. Подождите минуту." }, { status: 429 });
    }

    const report = await createVehicleHistoryReport({
      query,
      type,
      userId: session?.id,
      listingId: body.listingId ? String(body.listingId) : null,
      ip,
    });

    return NextResponse.json({
      id: report.id,
      status: report.status,
      summary: JSON.parse(report.summaryJson),
    });
  } catch (e) {
    console.error("[vehicle-history/lookup]", e);
    return NextResponse.json({ error: "Не удалось построить отчёт" }, { status: 500 });
  }
}
