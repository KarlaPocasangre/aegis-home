# SECURITY

Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [AI_INTEGRATION.md](AI_INTEGRATION.md) · [API_SPECS.md](API_SPECS.md) · [DATA_MODEL.md](DATA_MODEL.md)

Scope: a hackathon MVP that handles photos of people's homes. The aim is to prevent the incidents that hurt most in a public demo — leaked keys, runaway cost, data exposure, and service outage — without building enterprise security.

## 1. Data minimization (the strongest control)

- Photos are processed **in memory** and discarded. They are never written to disk, DB, or logs.
- The DB stores only structured hazard data. No names of residents, addresses, phone numbers, health data, or GPS.
- Emergency contacts (`{ name, phone }`) live only in the user's browser.
- Households expire (default 30 days) and can be deleted on demand (`DELETE /api/households/me`).
- Show a privacy notice before the first upload: photos may contain people, faces, or documents; they are analyzed by Meta's AI and not stored by this app; the analysis does not replace a professional and is not an emergency service.

## 2. Threat summary

| Threat | Impact | Mitigation |
|---|---|---|
| API key leaked via public repo / bundle | Cost, abuse | Key only on backend env; `.env` in `.gitignore`; `.env.example` without values; secret scanning (GitHub + `gitleaks`); never use `VITE_` for secrets; rotate immediately if leaked |
| Runaway AI spend | Credits drained / card charged | Per-IP + per-household rate limits, daily global cap in DB, degrade to cache/mock when hit; Meta's spend notification does **not** stop billing |
| Malicious upload (image bomb, disguised file) | Server crash / RCE class bugs | Size limit 5 MB, magic-byte check (`file-type`), `sharp` with `limitInputPixels`, re-encode, memory storage, max 2 concurrent analyses |
| Client-side checks bypassed | All of the above | Every client control is **repeated on the server** |
| Prompt injection via text in the photo | Wrong/misleading output | Injection-aware system prompt, JSON-only output, strict Zod bounds, no tools or side effects tied to model output, plain-text rendering |
| Model output corrupts data/UI | Broken UI, XSS | Zod validation before DB or response; coordinates are numbers in 0–1; no `dangerouslySetInnerHTML` |
| Token guessing / IDOR | Another family's data exposed | UUID v4 (122 bits of randomness), 404 for foreign resources, all queries scoped by household |
| Token leaks via URL | Exposure | Token sent in a header to the API; `Referrer-Policy: no-referrer`; `noindex`; sanitize logs; optional expiry/revoke; clear UI warning that the link grants access |
| Rate limit ineffective behind proxy | Abuse unthrottled | `app.set('trust proxy', 1)`; exclude `/health` |
| Cold start / outage during judging | Demo fails | UptimeRobot on `/health`, manual warm-up, fallback ladder with visible banner |
| Memory exhaustion on small instance | Crash | 5 MB cap, concurrency cap, no buffering beyond need |
| Dependency vulnerabilities | Supply chain | Lockfile, `npm audit` before submitting, few dependencies |
| Misleading safety claims | Harm / disqualification | Environmental hazards only, no medical advice, UI disclaimers, contact button described as a shortcut |

## 3. Express middleware order

```
helmet → cors(FRONTEND_URL only) → trust proxy set → body limits
→ /health (before rate limiting)
→ global rate limit
→ routes:
    POST /api/households           → stricter rate limit
    /api/* (except create)         → tokenAuth (header X-Household-Token, scoped lookup)
    POST …/rooms                   → analysis rate limit → spendCap → upload(memory) → handler
→ errorHandler (generic messages; logs error name/message only, never bodies)
```

## 4. Hardening checklist

### Must do (≈ 2–3 h)
- [ ] `.env` ignored before the first commit; `.env.example` committed; no secrets in history
- [ ] GitHub secret scanning on; `gitleaks` pre-commit or CI
- [ ] `META_API_KEY` only in backend environment (never `VITE_*`)
- [ ] Meta account in **standard** data mode (⚠️ VERIFY); billing alert set; daily cap implemented
- [ ] `app.set('trust proxy', 1)`; global + analysis rate limits; `/health` exempt
- [ ] `express.json({ limit: '100kb' })`, Multer memory storage, 5 MB limit, MIME allow-list
- [ ] Magic-byte check with `file-type`; `sharp` with `limitInputPixels`; re-encode and resize
- [ ] Zod: bounded AI output schema; Zod: all request inputs; invalid AI output → retry → fallback
- [ ] Household-scoped queries everywhere; 404 for foreign resources
- [ ] Generic error messages; no request bodies or tokens in logs
- [ ] `NODE_ENV=production`; Helmet defaults on (HSTS, nosniff, no `X-Powered-By`)

### Should do (≈ 1–2 h)
- [ ] `Referrer-Policy: no-referrer`, `noindex` meta/header on the SPA
- [ ] CSP in `vercel.json` (`default-src 'self'`; `connect-src` limited to the API origin; `img-src 'self' blob: data:`)
- [ ] Phone validation + `encodeURIComponent` for `tel:`/`sms:`/`wa.me`; geolocation only on tap
- [ ] Privacy/consent notice before upload; "anyone with this link" warning
- [ ] Fallback banner when `source !== "live"`
- [ ] `npm audit` clean (or accepted) before submission
- [ ] DB connection over SSL with a least-privilege user; Prisma query methods only

### Nice to have
- [ ] Token expiry/revoke UI; "delete my data" button
- [ ] Per-household daily room cap enforcement (already in API spec)

### Out of scope (deliberately)
Login/OAuth/JWT, WAF, penetration testing, compliance certifications, medical-device regulation. Say so plainly in the README.

## 5. Logging policy

- Log: timestamp, route, status, duration, error name, `source` of the analysis.
- Never log: request bodies, images, tokens, coordinates, hazard text, contact data, model responses.
- Render/Vercel logs include URL paths: the API path contains no token (token is a header); the SPA path `/h/<token>` appears only in Vercel access logs, which are private.

## 6. If something goes wrong

| Incident | Action |
|---|---|
| API key exposed | Revoke/rotate at once in the Meta console; update the Render env var; check usage |
| Unexpected spend | Set `MOCK_AI=true` (or lower `AI_DAILY_CALL_CAP`) and redeploy; review rate-limit logs |
| Token shared by mistake | `DELETE /api/households/me` and create a new household |
| Demo-day outage of Meta API | Fallback ladder serves cached/mock with a visible banner |

## 7. Honest limitations (put a short version in the README)

- Hazard detection is AI-generated and may miss risks or flag false ones.
- Cost figures are rough estimates.
- The app does not diagnose conditions and is not an emergency or monitoring service.
- Photos are sent to Meta's API for analysis.
