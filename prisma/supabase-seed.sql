-- HayMarket: тестовые данные для Supabase SQL Editor
-- Сначала выполните supabase-schema.sql (если таблиц ещё нет)
-- Пароль всех пользователей: 123456

-- Категории (главные)
INSERT INTO "Category" (id, name, slug, icon, "imageUrl", "sortOrder", "isActive", "showOnHome", "parentId", "createdAt")
VALUES
  ('cat_cars', 'Автомобили', 'cars', 'Car', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=90', 1, true, true, NULL, NOW()),
  ('cat_realestate', 'Недвижимость', 'real-estate', 'Building2', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=90', 2, true, true, NULL, NOW()),
  ('cat_electronics', 'Электроника', 'electronics', 'Smartphone', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=90', 3, true, true, NULL, NOW()),
  ('cat_jobs', 'Работа', 'jobs', 'Briefcase', 'https://images.unsplash.com/photo-1521737711862-e3b97375f902?w=800&q=90', 4, true, true, NULL, NOW()),
  ('cat_services', 'Услуги', 'services', 'Wrench', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=90', 5, true, true, NULL, NOW()),
  ('cat_home', 'Дом и мебель', 'home-furniture', 'Sofa', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=90', 6, true, true, NULL, NOW()),
  ('cat_clothing', 'Одежда', 'clothing', 'Shirt', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=90', 7, true, true, NULL, NOW()),
  ('cat_kids', 'Дети', 'kids', 'Baby', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=90', 8, true, true, NULL, NOW()),
  ('cat_animals', 'Животные', 'animals', 'PawPrint', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=90', 9, true, true, NULL, NOW()),
  ('cat_other', 'Другое', 'other', 'LayoutGrid', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=90', 10, true, true, NULL, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Подкатегории транспорта
INSERT INTO "Category" (id, name, slug, icon, "sortOrder", "isActive", "showOnHome", "parentId", "createdAt")
VALUES
  ('cat_new_cars', 'Новые из салона', 'new-cars', 'Sparkles', 2, true, false, 'cat_cars', NOW()),
  ('cat_car_rental', 'Аренда авто', 'car-rental', 'KeyRound', 3, true, false, 'cat_cars', NOW()),
  ('cat_car_parts', 'Запчасти и аксессуары', 'car-parts', 'Cog', 4, true, false, 'cat_cars', NOW()),
  ('cat_trucks', 'Грузовики и спецтехника', 'trucks', 'Truck', 5, true, false, 'cat_cars', NOW()),
  ('cat_machinery', 'Аренда техники', 'machinery-rental', 'Hammer', 6, true, false, 'cat_cars', NOW()),
  ('cat_moto', 'Мотоциклы и мототехника', 'motorcycles', 'Bike', 7, true, false, 'cat_cars', NOW()),
  ('cat_water', 'Водный транспорт', 'water-transport', 'Ship', 8, true, false, 'cat_cars', NOW()),
  ('cat_buses', 'Автобусы', 'buses', 'Bus', 9, true, false, 'cat_cars', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Пользователи (пароль: 123456)
INSERT INTO "User" (id, name, phone, email, "passwordHash", role, "isVerified", "verifiedAt", "ratingAvg", "ratingCount", "createdAt", "updatedAt")
VALUES
  ('user_admin', 'Админ', '+374 91 000000', 'admin@haymarket.am', '$2b$10$JrHYuLM0GwulTd99/4ueGeXKS3PScTmEA8hfvLYjVpTQeByS.8iyK', 'ADMIN', false, NULL, 0, 0, NOW(), NOW()),
  ('user_aram', 'Арам Петросян', '+374 91 123456', 'aram@test.com', '$2b$10$JrHYuLM0GwulTd99/4ueGeXKS3PScTmEA8hfvLYjVpTQeByS.8iyK', 'USER', true, NOW(), 4.8, 12, NOW(), NOW())
ON CONFLICT (phone) DO NOTHING;

-- Объявления
INSERT INTO "Listing" (id, title, description, price, currency, city, district, latitude, longitude, views, status, "isPromoted", "promotedUntil", "categoryId", "userId", "createdAt", "updatedAt")
VALUES
  ('list_car1', 'Toyota Camry 2019, полный привод', 'Один владелец, полная сервисная история.', 12500000, 'AMD', 'Ереван', 'Арабкир', 40.1776, 44.5126, 234, 'ACTIVE', true, NOW() + INTERVAL '7 days', 'cat_cars', 'user_aram', NOW(), NOW()),
  ('list_re1', '2-комнатная квартира в центре Еревана', '65 м², свежий ремонт, мебель, техника.', 85000000, 'AMD', 'Ереван', 'Кентрон', 40.1876, 44.5226, 512, 'ACTIVE', false, NULL, 'cat_realestate', 'user_aram', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Фото
INSERT INTO "ListingImage" (id, url, "sortOrder", "listingId")
VALUES
  ('img_car1', 'https://images.unsplash.com/photo-1621007947382-bcb3e97e3bdb?w=800&q=90', 0, 'list_car1'),
  ('img_re1', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=90', 0, 'list_re1')
ON CONFLICT (id) DO NOTHING;

-- Детали авто
INSERT INTO "CarDetails" (id, "listingId", brand, model, generation, year, mileage, transmission, "engineType", "engineVolume", "driveType", "bodyType", color, "ownersCount")
VALUES
  ('car_det1', 'list_car1', 'Toyota', 'Camry', 'XV70', 2019, 45000, 'Автомат', 'Бензин', 2.5, 'Полный', 'Седан', 'Белый', 1)
ON CONFLICT ("listingId") DO NOTHING;

-- Детали недвижимости
INSERT INTO "RealEstateDetails" (id, "listingId", "dealType", "propertyType", area, rooms, floor, "totalFloors")
VALUES
  ('re_det1', 'list_re1', 'SALE', 'APARTMENT', 65, 2, 5, 9)
ON CONFLICT ("listingId") DO NOTHING;
