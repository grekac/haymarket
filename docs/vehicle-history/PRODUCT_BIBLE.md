# HayMarket Vehicle History — Product Bible

## Vision

**HayPass Auto History** — встроенный в HayMarket сервис проверки истории авто для рынка Армении (аналог Автотеки по UX, адаптированный под локальные источники).

Покупатель в объявлении нажимает **«Проверить историю»** → вводит VIN / госномер / номер кузова → получает структурированный отчёт.

## Problem

На secondary-рынке AM нет единого публичного «автотеки». Покупатели боятся:
- скрученного пробега;
- скрытых ДТП / тотала;
- залога / ограничений;
- «серого» ввоза;
- авто в розыске.

## Solution (product)

1. Единый поиск (VIN / plate / chassis).
2. Отчёт с секциями и **прозрачным статусом источника** (`verified` / `partial` / `unavailable` / `demo`).
3. Покупка полного отчёта (готовый биллинг-хук Stripe/demo).
4. ЛК: мои отчёты.
5. Partner API для дилеров/банков.
6. Админка: мониторинг провайдеров, логи запросов.

## Data strategy for Armenia (designed, not invented as live feeds)

Реальных открытых API уровня Автотеки в РА **нет в публичном доступе**. Продукт строится на **adapter layer**:

| Adapter | Что даёт | Статус MVP |
|---------|----------|------------|
| `vin-decoder` | Марка/модель/год/завод по WMI/VIN | **Live** (локальный декодер) |
| `haymarket-internal` | Совпадения объявлений HayMarket по VIN/plate | **Live** |
| `customs-am` (planned) | Ввоз / растаможка | Adapter stub |
| `insurance-bureau-am` (planned) | Страховые случаи | Adapter stub |
| `traffic-police-am` (planned) | Розыск / ограничения (B2B договор) | Adapter stub |
| `inspection-am` (planned) | Техосмотр | Adapter stub |
| `demo-composite` | Структурированные placeholder-секции для UI | **Dev/demo only**, явно в UI |

**Правило продукта:** никогда не показывать вымышленные ДТП как «официальные». Пустые/недоступные блоки помечаются `unavailable` + причина.

## Personas

- Покупатель авто на HayMarket
- Продавец (добровольно показывает отчёт)
- Дилер / банк (Partner API)
- Админ HayMarket

## Success metrics

- CTR кнопки «Проверить историю» с карточки авто
- Conversion lookup → paid report
- Time-to-report P50 < 5s (кэш Redis planned)
- Provider error rate < 2%

## Pricing (draft)

- Базовый отчёт: 990 AMD
- Полный отчёт: 2 490 AMD  
(цифры продуктовые; биллинг — demo/Stripe как у продвижения)

## Non-goals (MVP)

- Не делаем отдельный домен/Nest-монолит с нуля — модуль внутри Next.js HayMarket.
- Не обещаем 100% покрытие ГАИ без договора.
