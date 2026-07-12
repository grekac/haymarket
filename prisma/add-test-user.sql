-- Тестовый аккаунт для проверки входа на HayMarket
-- Supabase → SQL Editor → Run
-- Телефон: +374 91 111111
-- Пароль:  123456

INSERT INTO "User" (
  id, name, phone, email, "passwordHash", role,
  "isVerified", "verifiedAt", "ratingAvg", "ratingCount",
  "createdAt", "updatedAt"
)
VALUES (
  'user_test_check',
  'Тест HayMarket',
  '+374 91 111111',
  'test@haymarket.am',
  '$2b$10$JrHYuLM0GwulTd99/4ueGeXKS3PScTmEA8hfvLYjVpTQeByS.8iyK',
  'USER',
  true,
  NOW(),
  5.0,
  1,
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  "passwordHash" = EXCLUDED."passwordHash",
  "isVerified" = true,
  "verifiedAt" = NOW(),
  "updatedAt" = NOW();
