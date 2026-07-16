# Performance (HayMarket)

Целевые оси: LCP, TTFB, JS weight, cacheability. Проверять Lighthouse на проде после деплоя.

## Сделано (2026-07)

| Область | Изменение |
|---------|-----------|
| Images | Убран `unoptimized` с ленты/галерей/категорий; AVIF/WebP; `priority` на первые карточки |
| Config | `optimizePackageImports: lucide-react`, long-cache `/_next/static`, `compress` |
| ISR | Header без `cookies()` — сессия в client island `/api/auth/me` |
| Home | `unstable_cache` public feed 60s; без full-table geo scan |
| Search | Кэш категорий; CarSelector через `next/dynamic`; без `expirePromotions` на read |
| Promo | `POST /api/cron/expire-promotions` (Bearer CRON_SECRET / SETUP_SECRET) |
| Fonts | Меньше весов Armenian; `preload: false` на вторичный шрифт |
| Deps | Удалён неиспользуемый `framer-motion` |

## Cron (Render)

Раз в час:

```
POST https://<host>/api/cron/expire-promotions
Authorization: Bearer <CRON_SECRET>
```

## Не обещаем цифры без замера

95+ Lighthouse зависит от сети, Cloudinary, cold start Render Free. После деплоя прогнать PageSpeed на `/ru` и `/ru/search`.
