-- HayMarket: ПОЛНЫЙ скрипт для Supabase SQL Editor
-- 1) Создаёт все таблицы
-- 2) Заполняет тестовыми данными
-- Пароль пользователей: 123456
-- Запустите ВЕСЬ файл одним нажатием Run

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('SALE', 'RENT');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnHome" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AMD',
    "city" TEXT NOT NULL,
    "district" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "condition" TEXT NOT NULL DEFAULT 'used',
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "videoUrl" TEXT,
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "promotedUntil" TIMESTAMP(3),
    "aiPriceHint" INTEGER,
    "attributes" TEXT,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CarBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarGeneration" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "yearFrom" INTEGER NOT NULL,
    "yearTo" INTEGER,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CarGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarDetails" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generation" TEXT,
    "year" INTEGER NOT NULL,
    "vin" TEXT,
    "mileage" INTEGER NOT NULL,
    "transmission" TEXT NOT NULL,
    "engineType" TEXT NOT NULL,
    "engineVolume" DOUBLE PRECISION,
    "power" INTEGER,
    "driveType" TEXT,
    "bodyType" TEXT,
    "color" TEXT,
    "ownersCount" INTEGER,
    "customsCleared" BOOLEAN NOT NULL DEFAULT true,
    "exchangePossible" BOOLEAN NOT NULL DEFAULT false,
    "bargainingPossible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CarDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealEstateDetails" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "dealType" "DealType" NOT NULL DEFAULT 'SALE',
    "propertyType" "PropertyType" NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "rooms" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "buildingYear" INTEGER,
    "renovationType" TEXT,
    "heating" TEXT,
    "balcony" TEXT,
    "bathrooms" INTEGER,
    "furniture" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RealEstateDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lang" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "authorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "listingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "notifyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE INDEX "Listing_city_idx" ON "Listing"("city");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- CreateIndex
CREATE INDEX "Listing_isPromoted_idx" ON "Listing"("isPromoted");

-- CreateIndex
CREATE UNIQUE INDEX "CarBrand_slug_key" ON "CarBrand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_brandId_slug_key" ON "CarModel"("brandId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CarGeneration_modelId_code_key" ON "CarGeneration"("modelId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CarDetails_listingId_key" ON "CarDetails"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateDetails_listingId_key" ON "RealEstateDetails"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_listingId_buyerId_key" ON "Conversation"("listingId", "buyerId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_targetId_listingId_key" ON "Review"("authorId", "targetId", "listingId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarModel" ADD CONSTRAINT "CarModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "CarBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarGeneration" ADD CONSTRAINT "CarGeneration_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDetails" ADD CONSTRAINT "CarDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateDetails" ADD CONSTRAINT "RealEstateDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ========== ДАННЫЕ ==========


-- РљР°С‚РµРіРѕСЂРёРё (РіР»Р°РІРЅС‹Рµ)
INSERT INTO "Category" (id, name, slug, icon, "imageUrl", "sortOrder", "isActive", "showOnHome", "parentId", "createdAt")
VALUES
  ('cat_cars', 'РђРІС‚РѕРјРѕР±РёР»Рё', 'cars', 'Car', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=90', 1, true, true, NULL, NOW()),
  ('cat_realestate', 'РќРµРґРІРёР¶РёРјРѕСЃС‚СЊ', 'real-estate', 'Building2', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=90', 2, true, true, NULL, NOW()),
  ('cat_electronics', 'Р­Р»РµРєС‚СЂРѕРЅРёРєР°', 'electronics', 'Smartphone', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=90', 3, true, true, NULL, NOW()),
  ('cat_jobs', 'Р Р°Р±РѕС‚Р°', 'jobs', 'Briefcase', 'https://images.unsplash.com/photo-1521737711862-e3b97375f902?w=800&q=90', 4, true, true, NULL, NOW()),
  ('cat_services', 'РЈСЃР»СѓРіРё', 'services', 'Wrench', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=90', 5, true, true, NULL, NOW()),
  ('cat_home', 'Р”РѕРј Рё РјРµР±РµР»СЊ', 'home-furniture', 'Sofa', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=90', 6, true, true, NULL, NOW()),
  ('cat_clothing', 'РћРґРµР¶РґР°', 'clothing', 'Shirt', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=90', 7, true, true, NULL, NOW()),
  ('cat_kids', 'Р”РµС‚Рё', 'kids', 'Baby', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=90', 8, true, true, NULL, NOW()),
  ('cat_animals', 'Р–РёРІРѕС‚РЅС‹Рµ', 'animals', 'PawPrint', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=90', 9, true, true, NULL, NOW()),
  ('cat_other', 'Р”СЂСѓРіРѕРµ', 'other', 'LayoutGrid', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=90', 10, true, true, NULL, NOW())
ON CONFLICT (slug) DO NOTHING;

-- РџРѕРґРєР°С‚РµРіРѕСЂРёРё С‚СЂР°РЅСЃРїРѕСЂС‚Р°
INSERT INTO "Category" (id, name, slug, icon, "sortOrder", "isActive", "showOnHome", "parentId", "createdAt")
VALUES
  ('cat_new_cars', 'РќРѕРІС‹Рµ РёР· СЃР°Р»РѕРЅР°', 'new-cars', 'Sparkles', 2, true, false, 'cat_cars', NOW()),
  ('cat_car_rental', 'РђСЂРµРЅРґР° Р°РІС‚Рѕ', 'car-rental', 'KeyRound', 3, true, false, 'cat_cars', NOW()),
  ('cat_car_parts', 'Р—Р°РїС‡Р°СЃС‚Рё Рё Р°РєСЃРµСЃСЃСѓР°СЂС‹', 'car-parts', 'Cog', 4, true, false, 'cat_cars', NOW()),
  ('cat_trucks', 'Р“СЂСѓР·РѕРІРёРєРё Рё СЃРїРµС†С‚РµС…РЅРёРєР°', 'trucks', 'Truck', 5, true, false, 'cat_cars', NOW()),
  ('cat_machinery', 'РђСЂРµРЅРґР° С‚РµС…РЅРёРєРё', 'machinery-rental', 'Hammer', 6, true, false, 'cat_cars', NOW()),
  ('cat_moto', 'РњРѕС‚РѕС†РёРєР»С‹ Рё РјРѕС‚РѕС‚РµС…РЅРёРєР°', 'motorcycles', 'Bike', 7, true, false, 'cat_cars', NOW()),
  ('cat_water', 'Р’РѕРґРЅС‹Р№ С‚СЂР°РЅСЃРїРѕСЂС‚', 'water-transport', 'Ship', 8, true, false, 'cat_cars', NOW()),
  ('cat_buses', 'РђРІС‚РѕР±СѓСЃС‹', 'buses', 'Bus', 9, true, false, 'cat_cars', NOW())
ON CONFLICT (slug) DO NOTHING;

-- РџРѕР»СЊР·РѕРІР°С‚РµР»Рё (РїР°СЂРѕР»СЊ: 123456)
INSERT INTO "User" (id, name, phone, email, "passwordHash", role, "isVerified", "verifiedAt", "ratingAvg", "ratingCount", "createdAt", "updatedAt")
VALUES
  ('user_admin', 'РђРґРјРёРЅ', '+374 91 000000', 'admin@haymarket.am', '$2b$10$JrHYuLM0GwulTd99/4ueGeXKS3PScTmEA8hfvLYjVpTQeByS.8iyK', 'ADMIN', false, NULL, 0, 0, NOW(), NOW()),
  ('user_aram', 'РђСЂР°Рј РџРµС‚СЂРѕСЃСЏРЅ', '+374 91 123456', 'aram@test.com', '$2b$10$JrHYuLM0GwulTd99/4ueGeXKS3PScTmEA8hfvLYjVpTQeByS.8iyK', 'USER', true, NOW(), 4.8, 12, NOW(), NOW())
ON CONFLICT (phone) DO NOTHING;

-- РћР±СЉСЏРІР»РµРЅРёСЏ
INSERT INTO "Listing" (id, title, description, price, currency, city, district, latitude, longitude, views, status, "isPromoted", "promotedUntil", "categoryId", "userId", "createdAt", "updatedAt")
VALUES
  ('list_car1', 'Toyota Camry 2019, РїРѕР»РЅС‹Р№ РїСЂРёРІРѕРґ', 'РћРґРёРЅ РІР»Р°РґРµР»РµС†, РїРѕР»РЅР°СЏ СЃРµСЂРІРёСЃРЅР°СЏ РёСЃС‚РѕСЂРёСЏ.', 12500000, 'AMD', 'Р•СЂРµРІР°РЅ', 'РђСЂР°Р±РєРёСЂ', 40.1776, 44.5126, 234, 'ACTIVE', true, NOW() + INTERVAL '7 days', 'cat_cars', 'user_aram', NOW(), NOW()),
  ('list_re1', '2-РєРѕРјРЅР°С‚РЅР°СЏ РєРІР°СЂС‚РёСЂР° РІ С†РµРЅС‚СЂРµ Р•СЂРµРІР°РЅР°', '65 РјВІ, СЃРІРµР¶РёР№ СЂРµРјРѕРЅС‚, РјРµР±РµР»СЊ, С‚РµС…РЅРёРєР°.', 85000000, 'AMD', 'Р•СЂРµРІР°РЅ', 'РљРµРЅС‚СЂРѕРЅ', 40.1876, 44.5226, 512, 'ACTIVE', false, NULL, 'cat_realestate', 'user_aram', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Р¤РѕС‚Рѕ
INSERT INTO "ListingImage" (id, url, "sortOrder", "listingId")
VALUES
  ('img_car1', 'https://images.unsplash.com/photo-1621007947382-bcb3e97e3bdb?w=800&q=90', 0, 'list_car1'),
  ('img_re1', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=90', 0, 'list_re1')
ON CONFLICT (id) DO NOTHING;

-- Р”РµС‚Р°Р»Рё Р°РІС‚Рѕ
INSERT INTO "CarDetails" (id, "listingId", brand, model, generation, year, mileage, transmission, "engineType", "engineVolume", "driveType", "bodyType", color, "ownersCount")
VALUES
  ('car_det1', 'list_car1', 'Toyota', 'Camry', 'XV70', 2019, 45000, 'РђРІС‚РѕРјР°С‚', 'Р‘РµРЅР·РёРЅ', 2.5, 'РџРѕР»РЅС‹Р№', 'РЎРµРґР°РЅ', 'Р‘РµР»С‹Р№', 1)
ON CONFLICT ("listingId") DO NOTHING;

-- Р”РµС‚Р°Р»Рё РЅРµРґРІРёР¶РёРјРѕСЃС‚Рё
INSERT INTO "RealEstateDetails" (id, "listingId", "dealType", "propertyType", area, rooms, floor, "totalFloors")
VALUES
  ('re_det1', 'list_re1', 'SALE', 'APARTMENT', 65, 2, 5, 9)
ON CONFLICT ("listingId") DO NOTHING;
