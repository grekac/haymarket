# HayMarket — деплой и DevOps

## Render (продакшен)

1. Подключите репозиторий GitHub → **Manual Deploy** или автодеплой с `main`
2. **Environment** (обязательно):
   - `DATABASE_URL` — Supabase **Session pooler** (не `db.*.supabase.co`)
   - `AUTH_SECRET`, `SETUP_SECRET`, `INTERNAL_SOCKET_SECRET`
   - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SOCKET_URL`
3. **Health checks:**
   - Render: `/api/health` (всегда 200 — для деплоя)
   - Мониторинг: `/api/ready` (503 если БД недоступна)
4. Сервис **haymarket-socket** — тот же `INTERNAL_SOCKET_SECRET` и `AUTH_SECRET`

## Supabase — миграции SQL

Выполните в **SQL Editor** по порядку (если ещё не делали):

| Файл | Содержимое |
|------|------------|
| `prisma/stage1-migration.sql` | Модерация, SMS, жалобы |
| `prisma/stage3-migration.sql` | AI price min/max |
| `prisma/stage4-migration.sql` | Чат: фото/видео/голос |
| `prisma/stage6-migration.sql` | Продвижение, аналитика |

Альтернатива для первого запуска: `/api/setup?key=ВАШ_SETUP_SECRET`

## CI (GitHub Actions)

Workflow `.github/workflows/ci.yml` на каждый push/PR:

- `prisma validate`
- `typecheck`
- `lint`
- `build`

## Docker (локально)

```bash
docker compose -f docker/docker-compose.yml up --build
```

Требует `output: "standalone"` в `next.config.ts` (уже включено).

## Опционально: Stripe (продвижение)

1. [dashboard.stripe.com](https://dashboard.stripe.com) → API keys
2. Render Environment:
   - `STRIPE_SECRET_KEY` — sk_live_... или sk_test_...
   - `STRIPE_WEBHOOK_SECRET` — из Webhooks → endpoint `https://ваш-домен/api/webhooks/stripe`, событие `checkout.session.completed`
3. Supabase SQL: `prisma/stage8-migration.sql`

Без Stripe — продвижение работает в demo-режиме (как раньше).

## Опционально: Sentry

```
SENTRY_DSN=https://...@sentry.io/...
```

Ошибки API и `onRequestError` отправляются в Sentry.

## Опционально: Upstash Redis

Для rate limit на нескольких инстансах Render:

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Без них — in-memory лимит (достаточно для одного инстанса).

## Опционально: мониторинг

- UptimeRobot / Better Stack → `https://ваш-домен/api/ready`
- Логи Render → JSON в `src/lib/logger.ts`
- Sentry: `SENTRY_DSN` (см. выше)

## Локали

Сайт: `/hy` (по умолчанию), `/ru`  
Админка: `/admin` (без локали)
