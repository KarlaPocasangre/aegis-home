# API Specification

> REST contract of the aegis-home backend: authentication, limits, errors and every endpoint with example payloads.

**Related:** [Architecture](ARCHITECTURE.md) · [Data model](DATA_MODEL.md) · [AI integration](AI_INTEGRATION.md) · [Security](SECURITY.md)

---

## Overview

| | |
|---|---|
| **Protocol** | REST over HTTPS, JSON. Image uploads use `multipart/form-data` |
| **Base path** | `/api` (plus `GET /health`) |
| **Auth** | `X-Household-Token: <uuid>` on every `/api` call except `POST /api/households` |
| **Server** | Node.js 22 + Express 5 · input validated with Zod |

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | [`/health`](#get-health) | Liveness probe |
| `POST` | [`/api/households`](#post-apihouseholds) | Create a household and its first assessment |
| `GET` | [`/api/households/me`](#get-apihouseholdsme) | Household summary |
| `DELETE` | [`/api/households/me`](#delete-apihouseholdsme) | Delete the household and all its data |
| `POST` | [`/api/assessments`](#post-apiassessments) | Create another assessment |
| `GET` | [`/api/assessments/:id`](#get-apiassessmentsid) | Assessment with rooms, hazards and the derived plan |
| `POST` | [`/api/assessments/:id/rooms`](#post-apiassessmentsidrooms) | Upload a room photo and run the live analysis |
| `PATCH` | [`/api/hazards/:id`](#patch-apihazardsid) | Mark a hazard resolved or pending |

---

## 1. Conventions

### 1.1 Authentication

There are no accounts. A household is identified by an unguessable **access token** (UUID v4 from `crypto.randomUUID()`, 122 random bits) returned by `POST /api/households`.

- The token travels in the **`X-Household-Token`** header, never in an API URL, so it does not appear in API access logs.
- The family's shareable link is `https://<frontend>/h/<token>`. The SPA reads the token from the path and sends it as a header. The frontend sets `Referrer-Policy: no-referrer` and `noindex`.
- Every query is scoped to the token's household. A resource owned by another household returns **404** (not 403), so IDs cannot be probed.
- Expired tokens are rejected with 401.
- CORS allows only `FRONTEND_URL`, methods `GET, POST, PATCH, DELETE`, and headers `Content-Type, X-Household-Token`.

### 1.2 Enums (lowercase on the wire)

| Field | Values |
|---|---|
| `severity` | `low` · `medium` · `high` |
| `status` | `pending` · `resolved` |
| `source` | `live` · `cached` · `mock` |
| `roomType` | `bathroom` · `kitchen` · `bedroom` · `living_room` · `hallway` · `stairs` · `entrance` · `outdoor` · `other` |
| `lang` / `language` | `es` · `pt` · `en` |

### 1.3 Errors

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Datos de entrada no válidos" } }
```

Messages are generic: no stack traces, no echoed input, no model output.

| HTTP | `code` | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON or multipart |
| 401 | `UNAUTHORIZED` | Missing, invalid or expired token |
| 404 | `NOT_FOUND` | Resource doesn't exist **or** belongs to another household |
| 413 | `PAYLOAD_TOO_LARGE` | Image over 5 MB or JSON over 100 KB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Not JPEG/PNG/WebP, or the magic bytes don't match |
| 422 | `VALIDATION_ERROR` | Invalid user input (Zod) |
| 429 | `RATE_LIMITED` | A rate limit or room cap was hit (`Retry-After` set on rate limits) |
| 502 | `AI_PROVIDER_ERROR` | The live analysis failed and there is no recording of this exact photo. Nothing is saved; retry in a minute |
| 500 | `INTERNAL_ERROR` | Anything unexpected |

Invalid model output is **not** a 422. It is a provider fault, handled with a retry and then the fallback ladder; the client sees 502 only if every level fails.

### 1.4 Limits

| Scope | Limit |
|---|---|
| Global, per IP | 100 requests / 15 min |
| `POST /api/households` | 10 / hour / IP |
| `POST /api/assessments/:id/rooms` | 5 / minute / IP · 20 rooms / day / household · 8 rooms / assessment |
| Concurrent analyses | 2 per instance |
| Meta API calls | `AI_DAILY_CALL_CAP` per UTC day; then only photos with a recorded result are answered (`cached`), others get 502 |
| Request bodies | JSON 100 KB · image 5 MB |
| `GET /health` | Excluded from all limits |

---

## 2. Endpoints

### `GET /health`

Liveness probe used by UptimeRobot and Render. It touches neither the database nor Meta.

**200**
```json
{ "status": "ok" }
```

---

### `POST /api/households`

Creates a household and its first assessment. Also purges expired households (lazy retention).

**Request** (all fields optional)
```json
{ "name": "Casa de abuela", "language": "es" }
```

| Field | Rules |
|---|---|
| `name` | Plain text, 1–80 characters |
| `language` | Language tag such as `es` or `es-SV`; default `es` |

**201**
```json
{
  "token": "3f0f7c3e-6d54-4a9a-8c35-2b9d9c3e1c11",
  "expiresAt": "2026-12-01T00:00:00.000Z",
  "assessmentId": "b8a1…"
}
```

The client stores the token and builds the shareable link. The UI tells the user: *anyone with this link can see this home's action plan.*

---

### `GET /api/households/me`

**200**
```json
{
  "name": "Casa de abuela",
  "expiresAt": "2026-12-01T00:00:00.000Z",
  "assessments": [
    { "id": "b8a1…", "createdAt": "2026-11-01T15:02:11.000Z", "roomCount": 3 }
  ]
}
```

---

### `DELETE /api/households/me`

Deletes the household and everything under it (cascade). Backs the **delete my data** button.

**204**, no body.

---

### `POST /api/assessments`

Creates an additional assessment, for example a later re-check of the same home.

**201**
```json
{ "id": "c2d4…", "createdAt": "2026-11-02T12:00:00.000Z" }
```

---

### `GET /api/assessments/:id`

Returns the assessment with its rooms, hazards and the derived plan.

**200**
```json
{
  "id": "b8a1…",
  "createdAt": "2026-11-01T15:02:11.000Z",
  "rooms": [
    {
      "id": "r1…",
      "type": "bathroom",
      "source": "live",
      "language": "es",
      "imageWidth": 1024,
      "imageHeight": 768,
      "hazards": [
        {
          "id": "hz1…",
          "aiId": "h1",
          "labelEn": "loose rug",
          "labelEs": "alfombra suelta",
          "severity": "high",
          "descriptionEs": "La alfombra no tiene base antideslizante junto a la ducha.",
          "fixEs": "Retírela o fíjela con cinta antideslizante por debajo.",
          "costEstimateUsd": 8,
          "materialsEs": ["cinta antideslizante"],
          "confidence": 0.8,
          "region": { "type": "polygon", "points": [0.12, 0.55, 0.41, 0.56, 0.40, 0.72, 0.13, 0.70] },
          "floorShare": 0.28,
          "status": "pending"
        }
      ]
    }
  ],
  "plan": {
    "totalHazards": 4,
    "resolved": 1,
    "pendingCostUsd": 31,
    "orderedHazardIds": ["hz1…", "hz4…", "hz2…"]
  }
}
```

`plan.orderedHazardIds` lists pending hazards by severity (high → low), then confidence. Region format: [Data model §4](DATA_MODEL.md#4-hazardregion-format). `floorShare` (0–1 or `null`) is the share of the visible floor the hazard covers, measured from SAM masks ([AI integration §6.1](AI_INTEGRATION.md#61-floor-share-a-metric-only-masks-can-give)).

---

### `POST /api/assessments/:id/rooms`

Uploads one room photo and runs the analysis **synchronously**: Muse Spark, then SAM 3.1 for each hazard. Muse Spark alone was measured at 13–22 s on a 1024 px photo; SAM calls run in parallel, and the whole analysis has a 55 s budget. A cold start on the free Render tier can add up to ~50 s.

**Content-Type:** `multipart/form-data`

| Field | Type | Rules |
|---|---|---|
| `image` | file | JPEG, PNG or WebP, ≤ 5 MB. Magic bytes checked, pixel limit enforced, re-encoded server-side |
| `roomType` | string | A `roomType` value; used as a hint for the model |
| `lang` | string | Optional: `es` (default), `pt` or `en`. Language the model writes the hazard text in |

**201** returns a `room` object (same shape as in `GET /api/assessments/:id`). When the result is not live, a `notice` is added:

```json
{
  "id": "r1…",
  "type": "bathroom",
  "source": "cached",
  "language": "es",
  "notice": "El servicio de análisis no está disponible en este momento. Se muestra un análisis real hecho antes para esta misma foto.",
  "imageWidth": 1024,
  "imageHeight": 768,
  "hazards": [ /* … */ ]
}
```

- `notice` is present only when `source` is not `live`, and the UI must display it prominently.
- `language` is the language the hazard text is **actually** in. A fallback may be in Spanish even if another language was requested; the UI says so.
- An empty `hazards` array is a valid result (the room looks safe), not an error.

**Errors:** 401 · 404 · 413 · 415 · 422 · 429 · 502

---

### `PATCH /api/hazards/:id`

Marks a fix as done, or undoes it.

**Request**
```json
{ "status": "resolved" }
```

**200**
```json
{ "id": "hz1…", "status": "resolved", "resolvedAt": "2026-11-01T09:20:00.000Z" }
```

Setting `pending` clears `resolvedAt`. The hazard must belong to the caller's household, or the response is 404.

---

## 3. Client contract

| Rule | Why |
|---|---|
| Send `X-Household-Token` on every `/api` call except household creation | Scoping and auth |
| Resize and re-encode photos before upload; show staged progress; tolerate ~60 s on a cold start | Privacy and perceived speed |
| Show `notice` in a visible banner whenever `source !== "live"` | A fallback is never presented as live AI |
| Draw a `region` only after checking its values are finite and within 0–1 | Untrusted coordinates never reach SVG unchecked |
| Render all model text as plain text | No HTML injection from model output |
| Contact button: validate the phone number, URL-encode the message, read location only on opt-in | No server call is involved |

---

## 4. Smoke test

```bash
npm run smoke-test -- https://<api-url>
```

The script checks `/health`, creates a household, uploads an image (a given file, or a generated one), asserts a `201` with a schema-valid room, reads the assessment back, and always deletes the household it created. Run it after every deploy.
