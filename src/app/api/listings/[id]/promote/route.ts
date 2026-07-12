import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PROMOTE_DAYS = 7;

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  if (listing.userId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const until = new Date();
  until.setDate(until.getDate() + PROMOTE_DAYS);

  const updated = await prisma.listing.update({
    where: { id },
    data: { isPromoted: true, promotedUntil: until },
  });
  return NextResponse.json(updated);
}
