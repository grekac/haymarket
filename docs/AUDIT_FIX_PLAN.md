# HayMarket — план исправлений (аудит 2026-07-18)

Живая проверка: https://haymarket-jct5.onrender.com (логин `+374 91 123456`).

## P0 — критично (ломает UX / данные)

| # | Проблема | Доказательство | Статус |
|---|----------|----------------|--------|
| 1 | `fixMojibake` портит нормальный кириллический title → `2-:><=0B=0O…` | Home/search/my; profile без fix показывает «2-комнатная…» | ✅ исправлено |
| 2 | Схема БД отстаёт: нет `articleNo` / VehicleHistory* → Prisma 500 на страницах с Listing | SQL error 42703; профиль мог падать | SQL `prisma/sql/sync-articleNo.sql` + db push (руки) |
| 3 | Locale: `next/link` вместо `@/i18n/navigation` → сброс на `hy` | ListingCard, BackButton, profile, home | ✅ частично (карточки/профиль/login/home) |
| 4 | Нет `error.tsx` — сырой Next error | glob 0 файлов | ✅ `error.tsx` + not-found |

## P1 — серьёзный UX

| # | Проблема | Где |
|---|----------|-----|
| 5 | Статус `ACTIVE` сырьём в профиле | profile/page.tsx |
| 6 | Theme FOUC / запись light до hydrate | ThemeProvider |
| 7 | BackButton `sticky top-0` под Header | BackButton.tsx |
| 8 | MobileNav + safe-area клип | MobileNav.tsx |
| 9 | Нет ThemeToggle на mobile header | Header.tsx |
| 10 | HeaderAuth CLS (null → bell) | HeaderAuth.tsx |
| 11 | Избранное всегда пустое сердце | ListingFavoriteButton |
| 12 | not-found мёртвые Tailwind токены | not-found.tsx |
| 13 | LoginForm `router.push` без locale | LoginForm.tsx |

## P2 — дизайн / анимация

| # | Проблема |
|---|----------|
| 14 | Нет `prefers-reduced-motion` |
| 15 | Мёртвые animate-* / shimmer / pulse-ring без `--accent-rgb` |
| 16 | InsightCards `to-white` в dark |
| 17 | Create + layout Header двойной chrome |
| 18 | CompareBar offset vs MobileNav |
| 19 | package-lock всё ещё содержит framer-motion |

## P3 — i18n / контент

| # | Проблема |
|---|----------|
| 20 | Хардкод русского на locale-страницах |
| 21 | LocaleSwitcher теряет query (`/search?q=`) |
| 22 | Дубли ThemeProvider / legacy Header |
| 23 | Дубли Camry в БД (2 одинаковых ACTIVE) |

## Порядок работ

1. ✅ Починить `fixMojibake` (P0-1)
2. ✅ Harden profile (try/catch + статусы RU + i18n Link)
3. ✅ error.tsx + not-found tokens
4. ✅ ThemeProvider (не писать light до hydrate) + BackButton top-12 + mobile ThemeToggle
5. ✅ ListingCard / BackButton / LoginForm / home → i18n navigation
6. ✅ SQL migration файл для articleNo
7. ⏳ Остальной polish: Pagination, CompareBar, favorites heart, LocaleSwitcher query, дубли ThemeProvider

Сборка после фикса: `npm run build` ✅


## Руками (прод)

```bash
npx prisma db push
# или SQL из prisma/sql/sync-missing-columns.sql
```
