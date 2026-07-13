-- Этап 6: аналитика и монетизация
DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PromotionOrder" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "package" TEXT NOT NULL,
  "days" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'AMD',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
  "provider" TEXT NOT NULL DEFAULT 'demo',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromotionOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ListingViewDaily" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ListingViewDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ListingViewDaily_listingId_date_key" ON "ListingViewDaily"("listingId", "date");
CREATE INDEX IF NOT EXISTS "PromotionOrder_userId_idx" ON "PromotionOrder"("userId");
CREATE INDEX IF NOT EXISTS "PromotionOrder_listingId_idx" ON "PromotionOrder"("listingId");
CREATE INDEX IF NOT EXISTS "PromotionOrder_createdAt_idx" ON "PromotionOrder"("createdAt");
CREATE INDEX IF NOT EXISTS "ListingViewDaily_listingId_idx" ON "ListingViewDaily"("listingId");
CREATE INDEX IF NOT EXISTS "ListingViewDaily_date_idx" ON "ListingViewDaily"("date");

DO $$ BEGIN
  ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PromotionOrder" ADD CONSTRAINT "PromotionOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ListingViewDaily" ADD CONSTRAINT "ListingViewDaily_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
