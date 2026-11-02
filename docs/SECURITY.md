# Security & Privacy

> aegis-home handles photos of people's homes. This document covers what we protect, the threats we designed against, the controls in place, and what is deliberately out of scope.

**Related:** [Architecture](ARCHITECTURE.md) · [AI integration](AI_INTEGRATION.md) · [API specs](API_SPECS.md) · [Data model](DATA_MODEL.md)

**Scope:** a hackathon MVP running in public. The goal is to prevent the incidents that hurt most (leaked keys, runaway AI spend, exposure of a family's data, outages) without enterprise overhead.

---

## 1. Data minimization: the strongest control

| Data | Handling |
|---|---|
| **Photos** | Processed **in memory only** (Multer memory storage → `sharp`) and discarded. Never written to disk, the database or logs |
| **Photo metadata** | EXIF/GPS dropped by re-encoding, in the browser (courtesy) and on the server (control) |
| **Analysis results** | Hazard text and normalized coordinates only |
| **Contacts** | Up to 3 `{ name, phone }` entries in the browser's `localStorage`; never sent to the server |
| **Location** | Read only when the user opts in to add it to a message; never sent to the server |
| **Households** | Expire after 30 days; deletable at any time with one button |

**Consent:** before the first upload, a privacy notice explains that photos may show people or documents, that they are analyzed by Meta's AI and not stored by this app, and that the result is neither a professional assessment nor an emergency service.

**Third-party processing:** photos are sent to the Meta Model API in **Standard data mode** (`muse-spark-1.3`; content not used for training).

---

## 2. Threat model

| Threat | Impact | Mitigation |
|---|---|---|
| API key leaked via repo or bundle | Cost, abuse | Key only in the backend env; `.env` git-ignored; `.env.example` has no values; GitHub secret scanning + push protection; `gitleaks` in CI; nothing secret in `VITE_*` |
| Runaway AI spend | Credits drained | Per-IP and per-household limits; daily AI call cap in Postgres; degrade to labeled fallbacks when hit |
| Malicious upload (image bomb, disguised file) | Crash, parser exploits | 5 MB limit; MIME allow-list + magic bytes (`file-type`); `sharp` `limitInputPixels`; re-encode; max 2 concurrent analyses |
| Bypassed client checks | All of the above | Every client control is **repeated on the server** |
| Prompt injection via text in the photo | Misleading output | Injection-aware prompt; JSON-only output; Zod bounds; no tools or side effects tied to model output |
| Model output corrupting UI/data | XSS, broken UI | Zod before DB and response; coordinates checked as finite 0–1 numbers; plain-text rendering only |
| Token guessing / IDOR | Another family's data exposed | UUID v4 (122 random bits); every query scoped by household; 404 for foreign resources |
| Token leaking via URL | Exposure | Token in a header for API calls; `Referrer-Policy: no-referrer`; `noindex`; clear "anyone with this link" warning; expiry + delete |
| Rate limits blind behind proxy | Unthrottled abuse | `trust proxy` set to 1; `/health` exempt |
| Memory exhaustion on a small instance | Outage | 5 MB cap, concurrency cap, no buffering beyond need |
| Vulnerable dependencies | Supply chain | Lockfile; few dependencies; `npm audit --omit=dev` clean |
| Misleading safety claims | User harm | Environmental hazards only, no medical advice, disclaimers in the UI and README |

---

## 3. Request pipeline (Express middleware order)

```
x-powered-by off · trust proxy
→ request logger (metadata only)
→ helmet (HSTS, nosniff, …)
→ cors (FRONTEND_URL only)
→ express.json (100 KB)
→ GET /health                       (before any rate limit)
→ global rate limit (100 / 15 min / IP)
→ /api/households                   POST: stricter limit · /me: token auth
→ /api/assessments                  token auth
     POST /:id/rooms                → analysis limit → concurrency cap (2) → upload (memory, 5 MB)
                                    → room caps → image pipeline → vision (daily AI cap)
→ /api/hazards                      token auth
→ 404 handler → error handler (generic messages; logs error name/message only)
```

---

## 4. Controls in place

### Secrets & cost
- [x] `.env` ignored from the first commit; no secrets in history
- [x] GitHub secret scanning + push protection; `gitleaks` on every push
- [x] `META_API_KEY` only in the backend environment
- [x] Daily AI call cap enforced atomically in Postgres before every Meta call
- [x] Standard data mode selected by model ID (never `-contributor`)

### Input & output validation
- [x] Zod on every request input and every model output
- [x] JSON 100 KB; uploads 5 MB in memory; MIME allow-list; magic-byte check
- [x] `sharp` with a pixel limit; re-encode and resize to 1024 px
- [x] Invalid model output → retry → labeled fallback, never a client error

### Access control
- [x] Household-scoped queries everywhere; 404 for foreign resources
- [x] Expired tokens rejected; on-demand deletion (`DELETE /api/households/me`)
- [x] Per-route rate limits; 8 rooms per assessment; 20 rooms per household per day

### Transport & frontend
- [x] Helmet defaults (HSTS, `nosniff`, no `X-Powered-By`); CORS allow-list
- [x] Strict CSP in `client/vercel.json` (`default-src 'self'`, `connect-src` limited to the API origin)
- [x] `Referrer-Policy: no-referrer`; `noindex`
- [x] Phone validation and `encodeURIComponent` for `tel:` / `sms:` / `wa.me` links
- [x] Fallback banner whenever a result is not live

### Database
- [x] SSL with `sslmode=verify-full`; Prisma query methods only (no raw SQL)
- [x] Cascading deletes; lazy purge of expired households

**Accepted for the hackathon:** the app connects with Neon's default owner role. Moderate `npm audit` advisories exist only in dev tooling (ESLint → `minimatch`).

### Out of scope, deliberately
Login/OAuth/JWT · WAF · penetration testing · compliance certifications · medical-device regulation.

---

## 5. Logging policy

| Logged | Never logged |
|---|---|
| Timestamp, method, route, status, duration | Request bodies, query strings, headers |
| Error name and message | Images, tokens, coordinates |
| Analysis `source` (`live` / `cached` / `mock`) and failure kind | Hazard text, contact data, model responses |

The API path never contains the token. The SPA path `/h/<token>` appears only in Vercel's private access logs.

---

## 6. Incident response

| Incident | Action |
|---|---|
| API key exposed | Revoke and rotate in the Meta console → update the Render env var → review usage |
| Unexpected spend | Set `MOCK_AI=true` or lower `AI_DAILY_CALL_CAP` → redeploy → review rate-limit logs |
| Household link shared by mistake | **Delete my data** (`DELETE /api/households/me`) and start a new household |
| Meta API outage | The fallback ladder serves recorded or sample results, always with a visible banner |

---

## 7. Known limitations

- Hazard detection is AI-generated: it can miss risks or flag false ones.
- Cost figures are rough estimates.
- The app does not diagnose conditions and is not an emergency or monitoring service.
- Photos are sent to Meta's API for analysis (Standard mode, not used for training).
- Anyone holding a household link can view and update that household until it expires or is deleted.
