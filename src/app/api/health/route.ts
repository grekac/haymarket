import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasDirect = Boolean(process.env.DIRECT_URL);
  const hasAuth = Boolean(process.env.AUTH_SECRET);

  try {
    await prisma.$queryRaw`SELECT 1`;
    const categories = await prisma.category.count();
    const listings = await prisma.listing.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      categories,
      listings,
      env: { hasDb, hasDirect, hasAuth },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: error instanceof Error ? error.message : String(error),
        env: { hasDb, hasDirect, hasAuth },
        hint: !hasDb
          ? "Добавьте DATABASE_URL и DIRECT_URL (Supabase) в Environment на Render"
          : !hasDirect
            ? "Добавьте DIRECT_URL (Supabase Session, порт 5432) для создания таблиц"
            : "Render Shell: npx prisma db push && npm run db:seed",
      },
      { status: 500 }
    );
  }
}
