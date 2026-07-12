import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { listingId, reason } = await request.json();
  if (!listingId || !reason?.trim()) {
    return NextResponse.json({ error: "Укажите причину" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      listingId,
      userId: session.id,
      reason: String(reason).trim().slice(0, 500),
    },
  });
  return NextResponse.json(report, { status: 201 });
}
