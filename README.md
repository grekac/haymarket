# HayMarket — Премиум платформа объявлений Армении

## Быстрый старт

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev:all    # Next.js + Socket.io чат
```

Откройте http://localhost:3000

## Тестовые аккаунты

| Роль  | Телефон          | Пароль |
|-------|------------------|--------|
| Админ | +374 91 000000   | 123456 |
| Юзер  | +374 91 123456   | 123456 |

## Возможности MVP

- Премиальный адаптивный дизайн (светлая/тёмная тема)
- 10 категорий с иконками
- Мобильное меню: Главная · Поиск · Подать · Сообщения · Профиль
- Объявления: авто (20+ полей) и недвижимость
- Множественные фото (Cloudinary или локальный fallback)
- Умный поиск, фильтры, пагинация
- Избранное, поделиться, показать номер
- Чат Socket.io между покупателем и продавцом
- Админ-панель: статистика, модерация, блокировка

## Docker

```bash
cd docker
docker compose up -d
```

## Cloudinary

Добавьте в `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## Архитектура

Подробный план: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
