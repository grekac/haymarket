-- Исправление кодировки UTF-8 (mojibake) в Supabase
-- Выполните в SQL Editor, если категории показываются как «РђРІС‚РѕРјРѕР±РёР»Рё»

UPDATE "Category" SET name = 'Автомобили' WHERE slug = 'cars';
UPDATE "Category" SET name = 'Недвижимость' WHERE slug = 'real-estate';
UPDATE "Category" SET name = 'Электроника' WHERE slug = 'electronics';
UPDATE "Category" SET name = 'Работа' WHERE slug = 'jobs';
UPDATE "Category" SET name = 'Услуги' WHERE slug = 'services';
UPDATE "Category" SET name = 'Дом и мебель' WHERE slug = 'home-furniture';
UPDATE "Category" SET name = 'Одежда' WHERE slug = 'clothing';
UPDATE "Category" SET name = 'Дети' WHERE slug = 'kids';
UPDATE "Category" SET name = 'Животные' WHERE slug = 'animals';
UPDATE "Category" SET name = 'Другое' WHERE slug = 'other';

UPDATE "User" SET name = 'Арам Петросян' WHERE id = 'user_aram';

UPDATE "Listing" SET
  title = 'Toyota Camry 2019, полный привод',
  description = 'Один владелец, полная сервисная история. Без ДТП.',
  city = 'Ереван',
  district = 'Арабкир'
WHERE id = 'list_car1';

UPDATE "Listing" SET
  title = '2-комнатная квартира в центре Еревана',
  description = '65 м², свежий ремонт, мебель, техника.',
  city = 'Ереван',
  district = 'Кентрон'
WHERE id = 'list_re1';

UPDATE "Listing" SET
  title = 'iPhone 15 Pro 256GB, как новый',
  description = 'Куплен в Ереване, полный комплект, чек и гарантия.'
WHERE id = 'list_iphone15';
