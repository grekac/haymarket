import { execSync } from "child_process";
import { prisma } from "@/lib/prisma";

export async function pushDatabaseSchema() {
  const direct = process.env.DATABASE_URL;
  if (!direct) throw new Error("Нет DATABASE_URL");

  execSync("npx prisma db push --accept-data-loss", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: direct },
  });
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
