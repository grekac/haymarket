# Vehicle History — System Architecture

## Placement

Модуль живёт **внутри HayMarket** (`/vehicle-history`), общие auth/Prisma/UI tokens.

```
haymarket/
├── docs/vehicle-history/          # Product + architecture docs
├── prisma/schema.prisma           # VehicleHistory* models
├── src/modules/vehicle-history/   # Domain services + providers
├── src/app/api/vehicle-history/   # Public + partner APIs
├── src/app/[locale]/vehicle-history/
└── src/components/vehicle-history/
```

## High-level flow

```mermaid
sequenceDiagram
  participant User
  participant UI as VehicleHistoryUI
  participant API as NextAPI
  participant Svc as HistoryService
  participant Cache as MemoryCache
  participant P as Providers
  participant DB as PostgreSQL

  User->>UI: VIN/plate/chassis
  UI->>API: POST /api/vehicle-history/lookup
  API->>Svc: createLookup
  Svc->>Cache: get fingerprint
  alt cache miss
    Svc->>P: fan-out adapters
    P-->>Svc: section payloads + status
    Svc->>DB: save report JSON
  end
  Svc-->>UI: reportId + summary
  User->>UI: open full report
```

## Modules

| Module | Responsibility |
|--------|----------------|
| `normalize` | VIN/plate/chassis cleanup + fingerprint |
| `providers/*` | External/internal data adapters |
| `history.service` | Orchestration, merge, persist |
| `access` | Ownership, paid unlock, API keys |
| `audit` | Request logs for admin/partners |

## Target scale stack (roadmap)

MVP: Next API + Prisma + Postgres (current).  
Scale: Redis cache, BullMQ queue for slow providers, S3 PDF export, Elasticsearch for plate/VIN search, Nest worker process.

## Security

- Rate limit lookups per IP/user
- Partner API key + HMAC optional
- PII (owner names) never in free preview
- Audit log of who requested what
- No secrets in client

## Roadmap

1. **MVP (now):** search UI, report shell, VIN decode, HayMarket matches, CTA on listing, schema, docs  
2. **Billing:** paid unlock of full report  
3. **Provider contracts:** customs / insurance / police B2B  
4. **Partner API v1 GA** + SLA  
5. **PDF export + Redis/queues**
