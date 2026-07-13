import { databaseUrlHint, isDirectSupabaseHost } from "@/lib/database-url";
import { prisma } from "@/lib/prisma";
import { rateLimitBackend } from "@/lib/rate-limit";
import packageJson from "../../package.json";

export type HealthReport = {
  ok: boolean;
  version: string;
  uptimeSec: number;
  rateLimit: string;
  database: string;
  categories?: number;
  listings?: number;
  message?: string;
  hint?: string;
  env?: Record<string, boolean | string>;
};

const startedAt = Date.now();

export async function getHealthReport(): Promise<HealthReport> {
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasAuth = Boolean(process.env.AUTH_SECRET);
  const hasSetup = Boolean(process.env.SETUP_SECRET);
  const base = {
    version: packageJson.version,
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    rateLimit: rateLimitBackend(),
    env: { hasDb, hasAuth, hasSetup },
  };

  if (!hasDb) {
    return {
      ...base,
      ok: false,
      database: "not_configured",
      hint: "Добавьте DATABASE_URL (Supabase Session pooler) в Environment",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const categories = await prisma.category.count();
    const listings = await prisma.listing.count();
    return {
      ...base,
      ok: true,
      database: "ready",
      categories,
      listings,
    };
  } catch (error) {
    const dbUrl = process.env.DATABASE_URL ?? "";
    const usesDirectHost = isDirectSupabaseHost(dbUrl);
    const message = error instanceof Error ? error.message : String(error);

    const needsSetup =
      message.includes("does not exist") ||
      message.includes("P2021") ||
      message.includes("relation");

    return {
      ...base,
      ok: false,
      database: needsSetup ? "needs_setup" : "connection_error",
      message,
      hint: needsSetup
        ? "Выполните SQL-миграции в Supabase или /api/setup?key=SETUP_SECRET"
        : usesDirectHost
          ? databaseUrlHint()
          : "Проверьте Session pooler URI из Supabase → Connect",
      env: { ...base.env, usesDirectHost: String(usesDirectHost) },
    };
  }
}
