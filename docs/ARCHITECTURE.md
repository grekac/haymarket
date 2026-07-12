# HayMarket — Архитектура платформы объявлений Армении

## Видение продукта

Премиальная минималистичная платформа объявлений для рынка Армении (2026).  
Не клон Avito — уникальный UX, чистый код, готовность к масштабированию.

---

## Технологический стек

| Слой | Технология |
|------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, CSS Variables (light/dark) |
| Backend | Next.js API Routes + Server Actions |
| Database | PostgreSQL 16 (Docker) |
| ORM | Prisma |
| Images | Cloudinary |
| Real-time | Socket.io (отдельный сервер) |
| Auth | JWT (httpOnly cookies) + bcrypt |
| Container | Docker + docker-compose |

---

## Структура папок

```
haymarket/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/
│   └── ARCHITECTURE.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── server/
│   └── socket/
│       └── index.ts              # Socket.io сервер чата
├── public/
├── src/
│   ├── app/
│   │   ├── (main)/               # Публичные страницы
│   │   │   ├── page.tsx          # Главная
│   │   │   ├── search/
│   │   │   ├── listing/[id]/
│   │   │   ├── create/
│   │   │   ├── favorites/
│   │   │   ├── messages/
│   │   │   └── profile/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/                # Админ-панель
│   │   └── api/                  # REST API
│   ├── components/
│   │   ├── ui/                   # Design System (Button, Card, Input...)
│   │   ├── layout/               # Header, Footer, MobileNav, ThemeToggle
│   │   ├── listings/             # ListingCard, Gallery, CarForm, RealEstateForm
│   │   ├── search/               # SearchBar, Filters, Pagination
│   │   └── chat/                 # ChatWindow, MessageBubble
│   ├── modules/                  # Бизнес-логика (Clean Architecture)
│   │   ├── listings/
│   │   │   ├── listing.service.ts
│   │   │   ├── listing.repository.ts
│   │   │   └── listing.types.ts
│   │   ├── auth/
│   │   ├── favorites/
│   │   ├── chat/
│   │   └── admin/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── cloudinary.ts
│   │   ├── auth.ts
│   │   ├── socket-client.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── styles/
│       └── globals.css
└── package.json
```

---

## Архитектурные принципы

### Clean Architecture (модули)

```
UI (components/app) → Services (modules/*.service.ts) → Repository (modules/*.repository.ts) → Prisma
```

- **Repository** — только доступ к БД
- **Service** — бизнес-логика, валидация
- **API Routes** — тонкий слой, вызывает Service
- **Components** — только UI, без прямых запросов к Prisma

### SOLID

- **S** — каждый service отвечает за одну область (Listings, Auth, Chat)
- **O** — формы объявлений расширяются через CarDetails / RealEstateDetails
- **L** — единый интерфейс ListingRepository
- **I** — узкие типы (CreateCarListingDto, CreateRealEstateDto)
- **D** — сервисы зависят от абстракций repository

---

## Модель данных

### Основные сущности

- **User** — роли USER | ADMIN, блокировка
- **Category** — 10 разделов с иконками
- **Listing** — базовое объявление + status (ACTIVE, PENDING, REJECTED...)
- **ListingImage** — множество фото (Cloudinary URL + publicId)
- **CarDetails** — 1:1 с Listing (марка, модель, VIN, пробег...)
- **RealEstateDetails** — 1:1 с Listing (площадь, комнаты, этаж...)
- **Favorite** — избранное пользователя
- **Conversation** + **Message** — чат продавец ↔ покупатель

---

## Этапы разработки

### Этап 1 — Фундамент ✅ (текущий)
- [x] План и архитектура
- [x] Docker (PostgreSQL + app)
- [x] Расширенная Prisma-схема
- [x] Cloudinary интеграция
- [x] Design System + light/dark тема
- [x] Модульная структура папок

### Этап 2 — UI Shell
- [x] Header + Mobile Bottom Nav (5 пунктов)
- [x] Главная: поиск, фильтры, категории с иконками
- [x] Адаптивность mobile / tablet / desktop

### Этап 3 — Объявления
- [ ] Создание с полями авто / недвижимость
- [ ] Множественная загрузка фото (Cloudinary)
- [ ] Страница объявления: галерея, fullscreen, share, favorite
- [ ] Показать номер телефона

### Этап 4 — Поиск и фильтры
- [ ] Умный поиск + сортировка
- [ ] Фильтры по категориям и полям авто/недвижимости
- [ ] Пагинация
- [ ] Похожие объявления

### Этап 5 — Социальные функции
- [ ] Избранное (работающее)
- [ ] Socket.io чат
- [ ] Страница сообщений

### Этап 6 — Админ-панель
- [ ] Dashboard со статистикой
- [ ] Модерация объявлений (edit/delete/approve)
- [ ] Управление пользователями (block)
- [ ] Управление категориями

### Этап 7 — Production
- [ ] Docker production build
- [ ] Оптимизация производительности
- [ ] SEO, metadata

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/listings              ?q &category &city &sort &page &filters
POST   /api/listings
GET    /api/listings/[id]
PUT    /api/listings/[id]
DELETE /api/listings/[id]

POST   /api/upload                Cloudinary multipart
POST   /api/favorites
DELETE /api/favorites/[listingId]
GET    /api/favorites

GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/[id]/messages
POST   /api/conversations/[id]/messages

GET    /api/admin/stats
GET    /api/admin/listings
PATCH  /api/admin/listings/[id]
DELETE /api/admin/listings/[id]
PATCH  /api/admin/users/[id]
```

---

## Docker

```bash
docker compose up -d          # PostgreSQL + Socket + App
npm run dev                   # Локальная разработка
```

---

## Переменные окружения

```env
DATABASE_URL=postgresql://haymarket:haymarket@localhost:5432/haymarket
AUTH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```
