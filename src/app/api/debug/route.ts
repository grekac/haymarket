import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { databaseUrlHint, isDirectSupabaseHost } from "@/lib/database-url";

/** Диагностика — только development */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const dbUrl = process.env.DATABASE_URL ?? "";

  if (!dbUrl) {
    return NextResponse.json({
      ok: false,
      problem: "no_database_url",
      hint: "Добавьте DATABASE_URL на Render",
    });
  }

  if (isDirectSupabaseHost(dbUrl)) {
    return NextResponse.json({
      ok: false,
      problem: "wrong_host",
      hint: databaseUrlHint(),
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const [categories, listings, users, images] = await Promise.all([
      prisma.category.count(),
      prisma.listing.count(),
      prisma.user.count(),
      prisma.listingImage.count(),
    ]);

    const activeListings = await prisma.listing.count({ where: { status: "ACTIVE" } });

    const sample = await prisma.listing.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true, title: true, status: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: listings > 0,
      connected: true,
      counts: { categories, listings, activeListings, users, images },
      sample,
      hint:
        listings === 0
          ? "База пустая — запустите supabase-full.sql в Supabase SQL Editor"
          : activeListings === 0
            ? "Объявления есть, но не ACTIVE"
            : "Данные есть — обновите главную (Ctrl+F5)",
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      connected: false,
      problem: "query_failed",
      error: error instanceof Error ? error.message : String(error),
      hint: databaseUrlHint(),
    });
  }
}
