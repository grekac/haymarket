-- Sync columns/tables expected by current Prisma schema (PostgreSQL / Supabase).
-- Run in SQL Editor if `prisma db push` is unavailable.

-- 1) Listing.articleNo
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "articleNo" INTEGER;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS n
  FROM "Listing"
  WHERE "articleNo" IS NULL
)
UPDATE "Listing" l
SET "articleNo" = numbered.n
FROM numbered
WHERE l.id = numbered.id;

CREATE SEQUENCE IF NOT EXISTS "Listing_articleNo_seq";
SELECT setval('"Listing_articleNo_seq"', COALESCE((SELECT MAX("articleNo") FROM "Listing"), 1));

ALTER TABLE "Listing"
  ALTER COLUMN "articleNo" SET DEFAULT nextval('"Listing_articleNo_seq"');

UPDATE "Listing" SET "articleNo" = nextval('"Listing_articleNo_seq"') WHERE "articleNo" IS NULL;
ALTER TABLE "Listing" ALTER COLUMN "articleNo" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Listing_articleNo_key" ON "Listing" ("articleNo");

-- 2) Fix known mojibake title if still corrupted in DB (optional)
UPDATE "Listing"
SET title = '2-комнатная квартира в центре Еревана',
    "updatedAt" = NOW()
WHERE title LIKE '2-:%' OR title LIKE '%:20@B8@0%';
