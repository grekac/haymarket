-- Этап 3: AI-оценка цены (диапазон)
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "aiPriceMin" INTEGER;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "aiPriceMax" INTEGER;
