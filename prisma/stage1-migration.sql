-- Этап 1: Supabase SQL Editor (если prisma db push недоступен)

CREATE TABLE IF NOT EXISTS "PhoneVerification" (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP;
