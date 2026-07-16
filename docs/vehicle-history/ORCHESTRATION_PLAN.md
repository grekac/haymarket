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
- [x] Коммит поимённо (`0c6b977`)
- [x] Фаза «готово» (API live на локали — blocked без Postgres; см. human)

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

- [x] Оплата полного отчёта (990 / 2490 AMD draft)
- [x] Статус unlock → `PAID`, enrichment только владельцу; FREE-кэш не шарит PAID
- [x] Build / reviews / фиксы
- [ ] Коммит поимённо
- [ ] Фаза «готово»

**Дефолты Phase 2:** demo unlock только non-prod или `ALLOW_DEMO_PAYMENTS=true`; Stripe webhook `metadata.type=vehicle_history`.

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
| 2026-07-16 | Phase 1 commit `0c6b977`. Live API blocked: нет локального Postgres/Docker. |
| 2026-07-16 | Phase 2 старт. Дефолт: FREE базовый отчёт; unlock full 2490 AMD (demo/Stripe); enrichment только после PAID; без фейковых verified ДТП. |
