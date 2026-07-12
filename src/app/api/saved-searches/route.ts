import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const items = await prisma.savedSearch.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { name, filters, notifyEnabled } = await request.json();
  if (!name || !filters) {
    return NextResponse.json({ error: "name и filters обязательны" }, { status: 400 });
  }

  const item = await prisma.savedSearch.create({
    data: {
      userId: session.id,
      name: String(name).trim(),
      filters: typeof filters === "string" ? filters : JSON.stringify(filters),
      notifyEnabled: notifyEnabled !== false,
    },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id обязателен" }, { status: 400 });

  await prisma.savedSearch.deleteMany({ where: { id, userId: session.id } });
  return NextResponse.json({ ok: true });
}
