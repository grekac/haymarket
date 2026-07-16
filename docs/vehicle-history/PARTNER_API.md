# HayPass Partner API (v1)

Partner lookup API for dealers, banks, and other B2B clients. Authenticated by API key; rate-limited per partner.

> **SLA:** No uptime/latency/completeness guarantees until live B2B data providers are contracted. MVP responses include adapter section statuses (`verified` | `partial` | `unavailable` | `demo`). Official AM sources that are not yet wired return `unavailable` — never fabricated crash/lien data.

Related: [TECH.md](./TECH.md) · [PRODUCT_BIBLE.md](./PRODUCT_BIBLE.md) · Admin UI: `/admin` → **HayPass** (`AdminHayPass`).

---

## Endpoint

```
POST /api/v1/partner/vehicle-history/lookup
```

### Auth header

| Header      | Required | Description                                      |
|-------------|----------|--------------------------------------------------|
| `X-Api-Key` | yes      | Full partner API key (shown once at creation)    |

Keys are stored as SHA-256 hashes. Only active keys (`isActive: true`) are accepted.

### Request body

```json
{
  "query": "WBA3A5C58DF123456",
  "type": "VIN",
  "listingId": "optional-listing-id"
}
```

| Field       | Type   | Required | Notes |
|-------------|--------|----------|-------|
| `query`     | string | **yes**  | VIN / plate / chassis. Trimmed; min length **5**. |
| `type`      | string | no       | `VIN` \| `PLATE` \| `CHASSIS`. Omit to let the service infer. Invalid values → `400`. |
| `listingId` | string | no       | Optional HayMarket listing id to attach context. |

### Success response — `200`

```json
{
  "reportId": "clx…",
  "summary": { },
  "payload": { }
}
```

- `summary` / `payload` — parsed report JSON (same shape as the app report; see [TECH.md](./TECH.md#report-json-shape)).
- Section `status` values reflect adapter outcomes for MVP (including `unavailable` stubs for planned B2B providers).

A successful call also writes an audit row: action `partner_lookup`, `actorId` = partner key id.

---

## Error responses

| Status | Body example | When |
|--------|--------------|------|
| `400`  | `{ "error": "query required" }` | Missing/short `query` (&lt; 5 chars) |
| `400`  | `{ "error": "type must be VIN, PLATE, or CHASSIS" }` | Invalid `type` |
| `401`  | `{ "error": "Missing X-Api-Key" }` | Header absent/empty |
| `401`  | `{ "error": "Invalid API key" }` | Unknown hash or inactive key |
| `429`  | `{ "error": "Rate limit exceeded" }` | Over partner limit (see below) |
| `500`  | `{ "error": "Internal server error" }` | Unexpected server failure |

---

## Rate limit

- Window: **1 minute** (60 seconds).
- Cap: per-partner field `VehicleHistoryPartnerKey.rateLimit` (requests per minute).
- Default when creating a key in admin: **60**/min (allowed range **1–10000**).
- Limit key: `vh:partner:{partnerId}`.

Exceeding the limit returns **429**.

---

## API key management (admins)

Keys are created in the HayMarket admin panel:

1. Sign in as `ADMIN`.
2. Open **`/admin`** → section **HayPass** (`AdminHayPass`).
3. Under **Партнёрские ключи**, enter partner **name** and optional **лимит / мин**.
4. Click **Создать**.

### One-time key reveal

- Response includes the full `apiKey` **only once** (create response + UI banner: «сохраните сейчас, он больше не покажется»).
- DB stores `keyHash` + `keyPrefix` (first 8 hex chars) — the raw key cannot be recovered later.
- Admins can list prefix/rateLimit/active status and toggle **Вкл/Выкл** (`isActive`); deactivated keys get `401 Invalid API key`.

Admin HTTP API (session + `ADMIN` role):

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/api/admin/vehicle-history/partners` | List keys (no secrets) |
| `POST` | `/api/admin/vehicle-history/partners` | Create key → returns `apiKey` once |
| `PATCH`| `/api/admin/vehicle-history/partners` | `{ id, isActive }` enable/disable |

---

## Example

```bash
curl -s -X POST "https://<host>/api/v1/partner/vehicle-history/lookup" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: <your-api-key>" \
  -d '{"query":"WBA3A5C58DF123456","type":"VIN"}'
```

---

## MVP data expectations

| Source | Partner-visible status |
|--------|------------------------|
| VIN decoder / HayMarket internal | May be `verified` / `partial` when data exists |
| Planned AM B2B adapters (customs, insurance, traffic police, inspection) | `unavailable` until contracts go live |

Partners should treat `unavailable` as “no source yet”, not as “clean vehicle”.
