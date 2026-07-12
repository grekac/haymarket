import { execSync } from "child_process";
import { databaseUrlHint, getDatabaseUrl } from "@/lib/database-url";
import { prisma } from "@/lib/prisma";

export async function pushDatabaseSchema() {
  const url = getDatabaseUrl();
  if (!url) throw new Error("Нет DATABASE_URL");

  try {
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "pipe",
      env: { ...process.env, DATABASE_URL: url },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`${msg}\n\n${databaseUrlHint()}`);
  }
}

export async function getDatabaseStatus() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const categories = await prisma.category.count();
    const listings = await prisma.listing.count();
    return { connected: true, categories, listings };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
