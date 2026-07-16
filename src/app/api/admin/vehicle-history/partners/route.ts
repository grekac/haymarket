import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const keys = await prisma.vehicleHistoryPartnerKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      rateLimit: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { name?: unknown; rateLimit?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  let rateLimit = 60;
  if (body.rateLimit != null) {
    const n = Number(body.rateLimit);
    if (!Number.isFinite(n) || n < 1 || n > 10000) {
      return NextResponse.json({ error: "rateLimit must be 1–10000" }, { status: 400 });
    }
    rateLimit = Math.floor(n);
  }

  const apiKey = randomBytes(32).toString("hex");
  const keyHash = createHash("sha256").update(apiKey).digest("hex");
  const keyPrefix = apiKey.slice(0, 8);

  const created = await prisma.vehicleHistoryPartnerKey.create({
    data: {
      name,
      keyHash,
      keyPrefix,
      rateLimit,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      rateLimit: true,
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      apiKey,
      keyPrefix: created.keyPrefix,
      name: created.name,
      rateLimit: created.rateLimit,
    },
    { status: 201 },
  );
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { id?: unknown; isActive?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be boolean" }, { status: 400 });
  }

  try {
    const updated = await prisma.vehicleHistoryPartnerKey.update({
      where: { id },
      data: { isActive: body.isActive },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        rateLimit: true,
        isActive: true,
        createdAt: true,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
