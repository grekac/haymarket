-- Категория «Авто» + объявление Toyota Camry
-- Supabase → SQL Editor → Run

INSERT INTO "Category" (
  id, name, slug, icon, "imageUrl", "sortOrder", "isActive", "showOnHome", "parentId", "createdAt"
)
VALUES (
  'cat_cars',
  'Автомобили',
  'cars',
  'Car',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=90',
  1,
  true,
  true,
  NULL,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS "CarDetails" (
  id TEXT PRIMARY KEY,
  "listingId" TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  generation TEXT,
  year INT NOT NULL,
  mileage INT NOT NULL,
  transmission TEXT NOT NULL,
  "engineType" TEXT NOT NULL,
  "engineVolume" DOUBLE PRECISION,
  "driveType" TEXT,
  "bodyType" TEXT,
  color TEXT,
  "ownersCount" INT,
  "customsCleared" BOOLEAN DEFAULT true,
  "exchangePossible" BOOLEAN DEFAULT false,
  "bargainingPossible" BOOLEAN DEFAULT true
);

INSERT INTO "Listing" (
  id, title, description, price, currency, city, district,
  latitude, longitude, views, status, "isPromoted", "promotedUntil",
  "categoryId", "userId", "createdAt", "updatedAt"
)
VALUES (
  'list_camry',
  'Toyota Camry 2019, полный привод',
  'Один владелец, полная сервисная история. Без ДТП.',
  12500000,
  'AMD',
  'Ереван',
  'Арабкир',
  40.1776,
  44.5126,
  234,
  'ACTIVE',
  true,
  NOW() + INTERVAL '7 days',
  'cat_cars',
  'user_aram',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  "categoryId" = 'cat_cars',
  "updatedAt" = NOW();

INSERT INTO "ListingImage" (id, url, "sortOrder", "listingId")
VALUES (
  'img_camry',
  'https://images.unsplash.com/photo-1621007947382-bcb3e97e3bdb?w=800&q=90',
  0,
  'list_camry'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "CarDetails" (
  id, "listingId", brand, model, generation, year, mileage,
  transmission, "engineType", "engineVolume", "driveType", "bodyType", color, "ownersCount"
)
VALUES (
  'car_camry',
  'list_camry',
  'Toyota',
  'Camry',
  'XV70',
  2019,
  45000,
  'Автомат',
  'Бензин',
  2.5,
  'Полный',
  'Седан',
  'Белый',
  1
)
ON CONFLICT ("listingId") DO NOTHING;
