import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Render health check — всегда HTTP 200, иначе деплой падает до /api/setup */
export async function GET() {
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasAuth = Boolean(process.env.AUTH_SECRET);
  const hasSetup = Boolean(process.env.SETUP_SECRET);

  if (!hasDb) {
    return NextResponse.json({
      ok: false,
      database: "not_configured",
      env: { hasDb, hasAuth, hasSetup },
      hint: "Добавьте DATABASE_URL (Supabase) в Environment на Render",
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    try {
      const categories = await prisma.category.count();
      const listings = await prisma.listing.count();
      return NextResponse.json({
        ok: true,
        database: "ready",
        categories,
        listings,
        env: { hasDb, hasAuth, hasSetup },
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        database: "needs_setup",
        message: error instanceof Error ? error.message : String(error),
        env: { hasDb, hasAuth, hasSetup },
        hint: hasSetup
          ? "Откройте /api/setup?key=ВАШ_SETUP_SECRET — создаст таблицы и тестовые данные"
          : "Добавьте SETUP_SECRET на Render, затем откройте /api/setup?key=ВАШ_СЕКРЕТ",
      });
    }
  } catch (error) {
    return NextResponse.json({
      ok: false,
      database: "connection_error",
      message: error instanceof Error ? error.message : String(error),
      env: { hasDb, hasAuth, hasSetup },
      hint: "Проверьте DATABASE_URL: postgresql://postgres:ПАРОЛЬ@db.qfrtdhkgmssbqdvqjxfe.supabase.co:5432/postgres",
    });
  }
}
