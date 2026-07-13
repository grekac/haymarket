import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDatabaseStatus, pushDatabaseSchema } from "@/lib/db-setup";
import { runQuickSeed } from "@/lib/quick-seed";

export const maxDuration = 300;

/** Одноразовая настройка БД без Render Shell (Free plan) */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const secret = process.env.SETUP_SECRET;

  if (!secret || key !== secret) {
    return NextResponse.json({ error: "Неверный ключ. Добавьте SETUP_SECRET на Render." }, { status: 401 });
  }

  const steps: string[] = [];

  try {
    steps.push("push schema");
    await pushDatabaseSchema();

    steps.push("quick seed");
    const seed = await runQuickSeed(prisma);

    const status = await getDatabaseStatus();

    return NextResponse.json({
      ok: true,
      steps,
      seed,
      status,
      ...(process.env.NODE_ENV !== "production"
        ? { login: { phone: "+374 91 123456", password: "123456" } }
        : {}),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        steps,
        error: error instanceof Error ? error.message : String(error),
        hint: "Используйте Session pooler из Supabase → Connect (не прямой db.*.supabase.co). Логин: postgres.qfrtdhkgmssbqdvqjxfe",
      },
      { status: 500 }
    );
  }
}
