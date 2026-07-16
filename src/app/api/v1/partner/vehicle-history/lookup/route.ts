import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { createVehicleHistoryReport } from "@/modules/vehicle-history/history.service";

const VALID_TYPES = new Set(["VIN", "PLATE", "CHASSIS"]);

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key") || "";
    if (!apiKey) return NextResponse.json({ error: "Missing X-Api-Key" }, { status: 401 });

    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    const partner = await prisma.vehicleHistoryPartnerKey.findFirst({
      where: { keyHash, isActive: true },
    });
    if (!partner) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

    const allowed = await rateLimit(`vh:partner:${partner.id}`, partner.rateLimit, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    const query = String(body.query || "").trim();
    if (query.length < 5) return NextResponse.json({ error: "query required" }, { status: 400 });

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
        ? (String(typeRaw) as "VIN" | "PLATE" | "CHASSIS")
        : undefined;

    const report = await createVehicleHistoryReport({
      query,
      type,
      listingId: body.listingId,
      ip: req.headers.get("x-forwarded-for"),
    });

    await prisma.vehicleHistoryAuditLog.create({
      data: {
        action: "partner_lookup",
        actorId: partner.id,
        metaJson: JSON.stringify({ reportId: report.id }),
      },
    });

    return NextResponse.json({
      reportId: report.id,
      summary: JSON.parse(report.summaryJson),
      payload: JSON.parse(report.payloadJson),
    });
  } catch (e) {
    console.error("[partner/vehicle-history/lookup]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
