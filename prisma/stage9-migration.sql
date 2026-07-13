-- Stage 9: Admin-configurable category field schemas
CREATE TABLE IF NOT EXISTS "CategoryFieldSchema" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "schema" TEXT NOT NULL,
  "layoutType" TEXT NOT NULL DEFAULT 'premium',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CategoryFieldSchema_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CategoryFieldSchema_categoryId_key"
  ON "CategoryFieldSchema"("categoryId");

ALTER TABLE "CategoryFieldSchema"
  ADD CONSTRAINT "CategoryFieldSchema_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
