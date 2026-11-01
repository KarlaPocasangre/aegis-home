# API_SPECS

Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [DATA_MODEL.md](DATA_MODEL.md) · [AI_INTEGRATION.md](AI_INTEGRATION.md) · [SECURITY.md](SECURITY.md)

REST over HTTPS, JSON (except the image upload, which is `multipart/form-data`).
Base path: `/api`. Backend: Node.js + Express 5.

## 1. Conventions

### Authentication
There are no accounts. A household is identified by an unguessable **access token** (UUID v4 from `crypto.randomUUID()`), created by `POST /api/households`.

- The token is sent in the header **`X-Household-Token`** (not in the API URL, so it doesn't appear in server access logs).
- The frontend link that a family shares looks like `https://<frontend>/h/<token>`; the SPA reads the token from the path and sends it as a header. The frontend sets `Referrer-Policy: no-referrer` and `noindex`.
- Every query filters by the household that owns the token. A resource belonging to another household returns **404** (not 403), so IDs can't be enumerated.
- CORS allows only `FRONTEND_URL`, with headers `Content-Type` and `X-Household-Token` and methods `GET, POST, PATCH, DELETE`.

### Common response headers
`X-Content-Type-Options: nosniff`, HSTS, no `X-Powered-By` (via Helmet).

### Enums (API uses lowercase)
- `severity`: `low | medium | high`
- `status`: `pending | resolved`
- `source`: `live | cached | mock`
- `roomType`: `bathroom | kitchen | bedroom | living_room | hallway | stairs | entrance | outdoor | other`

### Error format

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Datos de entrada no válidos" } }
```

Messages are generic. No stack traces, no echoed input, no model output in errors.

| HTTP | `code` | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON or multipart |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired/revoked token |
| 404 | `NOT_FOUND` | Resource doesn't exist **or** belongs to another household |
| 413 | `PAYLOAD_TOO_LARGE` | Image over 5 MB or JSON over the limit |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Not JPEG/PNG/WebP, or magic bytes don't match |
| 422 | `VALIDATION_ERROR` | Invalid user input (Zod) |
| 429 | `RATE_LIMITED` | Rate limit hit (`Retry-After` header set) |
| 502 | `AI_PROVIDER_ERROR` | Provider failed *and* no fallback could be produced |
| 500 | `INTERNAL_ERROR` | Anything unexpected |

Invalid AI output is **not** a 422: it is a provider fault, handled with retry then the fallback ladder; only if everything fails does the client see 502.

### Rate limits

| Scope | Limit |
|---|---|
| Global (per IP) | 100 requests / 15 min |
| `POST /api/households` | 10 / hour / IP |
| `POST /api/assessments/:id/rooms` | 5 / minute / IP, and 20 rooms / day / household |
| Global AI spend cap | `AI_DAILY_CALL_CAP` calls/day, then degrade to cache/mock |
| `GET /health` | **Excluded** from limits |

Requires `app.set('trust proxy', 1)` behind Render. Request body limit: JSON 100 KB, upload 5 MB, max **2 concurrent analyses** per instance.

---

## 2. Endpoints

### `GET /health`
Liveness probe for UptimeRobot. Does not touch the DB or Meta API.

**200**
```json
{ "status": "ok" }
```

---

### `POST /api/households`
Create a household and its first assessment. Also triggers lazy cleanup of expired households.

**Request**
```json
{ "name": "Casa de abuela", "language": "es" }
```
- `name`: optional, ≤ 80 chars (plain text). `language`: optional, default `"es"`.

**201**
```json
{
  "token": "3f0f7c3e-6d54-4a9a-8c35-2b9d9c3e1c11",
  "expiresAt": "2026-11-28T00:00:00.000Z",
  "assessmentId": "b8a1…"
}
```
The client stores the token and builds the shareable link. Show: *"Anyone with this link can see this home's action plan."*

---

### `GET /api/households/me`
**Headers:** `X-Household-Token`

**200**
```json
{
  "name": "Casa de abuela",
  "expiresAt": "2026-11-28T00:00:00.000Z",
  "assessments": [
    { "id": "b8a1…", "createdAt": "2026-10-30T15:02:11.000Z", "roomCount": 3 }
  ]
}
```

---

### `DELETE /api/households/me`
Deletes the household and everything under it (cascade).

**204** (no body)

---

### `POST /api/assessments`
Create an additional assessment (e.g., a later re-check).

**201**
```json
{ "id": "c2d4…", "createdAt": "2026-11-02T12:00:00.000Z" }
```

---

### `GET /api/assessments/:id`
Returns the assessment with its rooms, hazards, and the derived plan.

**200**
```json
{
  "id": "b8a1…",
  "createdAt": "2026-10-30T15:02:11.000Z",
  "rooms": [
    {
      "id": "r1…",
      "type": "bathroom",
      "source": "live",
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
          "region": { "type": "bbox", "points": [0.12, 0.55, 0.3, 0.18] },
          "status": "pending"
        }
      ]
    }
  ],
  "plan": {
    "totalHazards": 4,
    "resolved": 1,
    "pendingCostUsd": 31,
    "orderedHazardIds": ["hz1…", "hz4…", "hz2…", "hz3…"]
  }
}
```
`plan.orderedHazardIds`: pending hazards by severity (high → low), then confidence.

---

### `POST /api/assessments/:id/rooms`
Upload one room photo and run the analysis. **Synchronous**; may take up to ~30 s (the client shows progress). A cold start can add up to ~50 s on a free Render instance.

**Content-Type:** `multipart/form-data`

| Field | Type | Rules |
|---|---|---|
| `image` | file | JPEG/PNG/WebP, ≤ 5 MB; validated by magic bytes; pixel limit enforced; re-encoded server-side |
| `roomType` | string | One of the `roomType` enum |
| `lang` | string | Optional. `es` (default) \| `pt` \| `en`: language the model writes the hazard text in |

Limits: max 8 rooms per assessment.

Every `room` object carries `language` (`es | pt | en`): the language its hazard text is actually in. A fallback can be in Spanish even when another language was asked for; the UI says so.

**201** — a `room` object (same shape as in `GET /api/assessments/:id`), plus an optional notice:
```json
{
  "id": "r1…",
  "type": "bathroom",
  "source": "cached",
  "notice": "Resultado de ejemplo: el servicio de análisis no está disponible en este momento.",
  "imageWidth": 1024,
  "imageHeight": 768,
  "hazards": [ /* … */ ]
}
```
`notice` is present only when `source` is not `live`. The UI must display it prominently.

**Errors:** 401, 404, 413, 415, 422, 429, 502.

An empty `hazards` array is a valid result (the room looks safe), not an error.

---

### `PATCH /api/hazards/:id`
Mark a fix as done or undo it.

**Request**
```json
{ "status": "resolved" }
```

**200**
```json
{ "id": "hz1…", "status": "resolved", "resolvedAt": "2026-10-31T09:20:00.000Z" }
```
Setting `pending` clears `resolvedAt`. The hazard must belong to the caller's household (else 404).

---

### `POST /api/voice/checkin` *(stretch — only if time allows)*
Transcribes a short Spanish voice message (Muse Voice Transcribe).

**Content-Type:** `multipart/form-data`, field `audio` (≤ 2 MB, ≤ 30 s).
**200**
```json
{ "transcript": "Me siento bien, hoy casi me resbalo en el baño." }
```
The transcript is plain text; it triggers nothing automatically. It follows the same rate limit and spend cap as analysis calls. Audio is processed in memory and never stored.

---

## 3. Client behavior contract

- Send `X-Household-Token` on every `/api` call except `POST /api/households`.
- Resize and re-encode the image before upload (canvas). Show a progress indicator for analysis; tolerate up to ~60 s on a cold start.
- If `source !== "live"`, render `notice` in a visible banner.
- Render `region` coordinates only after verifying they are finite numbers within 0–1, scaled to the displayed image size.
- Render all model-generated text as plain text.
- Emergency-contact button: validate the phone number, build `tel:` / `sms:` / `https://wa.me/<digits>?text=<encoded>` links, request geolocation only on tap. No server call is involved.

## 4. Smoke test

`npm run smoke-test -- https://<backend>` should: call `/health`, create a household, upload a known image, assert a 201 with a schema-valid room, delete the household. Run it after every deploy and before recording the demo.
