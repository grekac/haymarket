# Vehicle History — Database, API, Security, UI

## Database (Prisma)

- `VehicleHistoryLookup` — запрос (query type/value, user, ip hash)
- `VehicleHistoryReport` — результат (normalized keys, JSON body, price status)
- `VehicleHistoryPartnerKey` — ключи партнёров
- `VehicleHistoryAuditLog` — аудит

Fingerprint: `sha256(normalized query)` для дедупа/кэша.

## API

### App

- `POST /api/vehicle-history/lookup` `{ query, type?, listingId? }`
- `GET /api/vehicle-history/reports/[id]`
- `GET /api/vehicle-history/my`

### Partner

- `POST /api/v1/partner/vehicle-history/lookup` header `X-Api-Key`
- Body: `{ query, type?: VIN|PLATE|CHASSIS, listingId? }`
- Rate limit: `partner.rateLimit` requests per minute → `429` when exceeded
- Key management: `/admin` HayPass (`AdminHayPass`) — one-time key reveal on create
- Full reference: [PARTNER_API.md](./PARTNER_API.md)

## Report JSON shape

```json
{
  "query": { "type": "vin", "value": "..." },
  "vehicle": { "make": "...", "model": "...", "year": 2018 },
  "sections": [
    {
      "id": "mileage",
      "title": "Пробег",
      "status": "partial",
      "source": "haymarket-internal",
      "items": []
    }
  ],
  "disclaimers": ["..."]
}
```

Statuses: `verified` | `partial` | `unavailable` | `demo`

## UI Guide

- Same CSS variables as HayMarket (light/dark)
- Minimal screens: Search → Summary → Full report
- Listing CTA: secondary outline button «Проверить историю»
- Always show source badges on sections
