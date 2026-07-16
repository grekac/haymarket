import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = req.nextUrl.searchParams.get("limit");
  const parsed = raw != null ? Number.parseInt(raw, 10) : 50;
  const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 200) : 50;

  const items = await prisma.vehicleHistoryAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      actorId: true,
      metaJson: true,
      createdAt: true,
    },
  });

  return NextResponse.json(items);
}
