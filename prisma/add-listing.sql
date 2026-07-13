-- Новое объявление для HayMarket (Supabase → SQL Editor → Run)
-- Появится на главной после обновления сайта

-- Пользователь (если ещё нет)
INSERT INTO "User" (
  id, name, phone, email, "passwordHash", role,
  "isVerified", "verifiedAt", "ratingAvg", "ratingCount",
  "createdAt", "updatedAt"
)
VALUES (
  'user_aram',
  'Арам Петросян',
  '+374 91 123456',
  'aram@test.com',
  '$2b$10$JrHYuLM0GwulTd99/4ueGeXKS3PScTmEA8hfvLYjVpTQeByS.8iyK',
  'USER',
  true,
  NOW(),
  4.8,
  12,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO NOTHING;

-- Категория «Электроника» (если ещё нет)
INSERT INTO "Category" (
  id, name, slug, icon, "imageUrl", "sortOrder", "isActive", "showOnHome", "parentId", "createdAt"
)
VALUES (
  'cat_electronics',
  'Электроника',
  'electronics',
  'Smartphone',
  'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=90',
  3,
  true,
  true,
  NULL,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Объявление: iPhone 15 Pro
INSERT INTO "Listing" (
  id, title, description, price, currency, city, district,
  latitude, longitude, views, status, "isPromoted", "promotedUntil",
  "categoryId", "userId", "createdAt", "updatedAt"
)
VALUES (
  'list_iphone15',
  'iPhone 15 Pro 256GB, как новый',
  'Куплен в Ереване, полный комплект, чек и гарантия. Батарея 98%. Без царапин, всегда в чехле.',
  680000,
  'AMD',
  'Ереван',
  'Кентрон',
  40.1776,
  44.5126,
  47,
  'ACTIVE',
  true,
  NOW() + INTERVAL '5 days',
  'cat_electronics',
  'user_aram',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  "isPromoted" = true,
  "updatedAt" = NOW();

-- Фото
INSERT INTO "ListingImage" (id, url, "sortOrder", "listingId")
VALUES (
  'img_iphone15',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=90',
  0,
  'list_iphone15'
)
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;
