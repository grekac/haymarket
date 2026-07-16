# HayPass Orchestration Plan

Статус оркестрации реализации сервиса проверки истории авто внутри HayMarket.

**Решения (дефолты):**
- Продукт внутри HayMarket (`/vehicle-history`), не отдельный репо.
- Официальные источники AM — adapter stubs со статусом `unavailable` (не фейковые ДТП).
- Биллинг отчётов — demo/Stripe-хук по образцу продвижения (Phase 2).
- Не деплоить / не пушить в origin до явной просьбы пользователя.
- Коммиты только файлов фазы, поимённо.

## Progress vs git

| Метка | Состояние |
|-------|-----------|
| Last commit on main | `1d6f8a6` Avito mobile home / my ads / create flow |
| Vehicle-history code | **uncommitted** (локально) |
| Seed 20 listings | локальный скрипт есть; прод не засеян (нужен DATABASE_URL/SETUP) |

---

## Phase 1 — MVP каркас

Цель: поиск VIN/plate/chassis, отчёт, CTA на карточке авто, Prisma-модели, docs, Partner API stub.

- [x] Код MVP на месте (docs, schema, modules, API, UI, CTA)
- [x] `npm run build` зелёный
- [~] Живая проверка: HTML `/ru/vehicle-history` 200; VIN decode smoke `WBA→BMW/2013`; **API lookup blocked** (локальный `DATABASE_URL=file:` vs postgresql schema; Docker отсутствует)
- [x] Code review (свежий агент) + повтор после фиксов
- [x] Security review (свежий агент)
- [x] Фиксы по ревью (cache unique, my via lookups, ACTIVE-only, plate match, rateLimit, i18n links, partner type/rateLimit)
- [ ] Коммит поимённо
- [ ] Фаза «готово»

**Дефолт Phase 1:** gate `paymentStatus` на GET отчёта отложен на Phase 2 (сейчас все отчёты `FREE`, PII нет). Stale 24h cache с SOLD неактуален до первого прода (данные ещё не в проде).

**Файлы фазы (ожидаемые):**
- `docs/vehicle-history/**`
- `prisma/schema.prisma` (только VehicleHistory*)
- `src/modules/vehicle-history/**`
- `src/app/api/vehicle-history/**`
- `src/app/api/v1/partner/vehicle-history/**`
- `src/app/[locale]/vehicle-history/**`
- `src/components/vehicle-history/**`
- `src/components/listing/car/CarListingView.tsx` (только CTA)

---

## Phase 2 — Billing unlock

- [ ] Оплата полного отчёта (990 / 2490 AMD draft)
- [ ] Статус `UNPAID` → `PAID`, скрытие PII до оплаты
- [ ] Build / live / reviews / commit

---

## Phase 3 — ЛК + Админка

- [ ] «Мои отчёты» в профиле (`/api/vehicle-history/my` + UI)
- [ ] Админ: audit log, partner keys, счётчики lookups
- [ ] Build / live / reviews / commit

---

## Phase 4 — Partner API GA

- [ ] Документация Partner API, rate limit, key management UI/seed
- [ ] Build / live / reviews / commit

---

## Phase 5 — Scale readiness (без внешних контрактов)

- [ ] PDF export stub или HTML print
- [ ] Redis cache hook (optional env)
- [ ] Docs roadmap update
- [ ] Build / live / reviews / commit

---

## Blocked / needs human

- Прод: `prisma db push` + seed 20 объявлений на Render/Supabase (нет локального postgres URL).
- Реальные B2B-контракты ГАИ/страховки — вне кода.

## Orchestrator log

| Когда | Событие |
|-------|---------|
| 2026-07-16 | Старт оркестрации. Phase 1 код есть uncommitted → приёмка. |
