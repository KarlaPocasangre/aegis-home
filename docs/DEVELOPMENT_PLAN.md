# Development Log & Roadmap

> How aegis-home was built during the hackathon: principles, timeline, definition of done, scope management, and what comes next.

**Related:** [Context](CONTEXT.md) · [Architecture](ARCHITECTURE.md) · [AI integration](AI_INTEGRATION.md) · [Security](SECURITY.md)

---

## 1. Engineering principles

1. **Vertical slice first:** one real photo through Express → Muse Spark → screen before any polish.
2. **Deploy early:** production infrastructure (Render, Vercel, Neon) from day one, so deployment surprises surface early.
3. **One flow that works perfectly** beats many half-built features.
4. **Honest AI:** a result that did not come from a live model call is always labeled.
5. **Everything built during the event:** small, frequent commits, never squashed or rewritten, so the history is the evidence.

---

## 2. Build timeline

All dates are 2026. The [commit history](https://github.com/KarlaPocasangre/aegis-home/commits/main) is the authoritative record.

| Date | Milestone | Highlights |
|---|---|---|
| **Oct 31** | Foundation | Specifications in `docs/`; npm workspaces; Prisma data model and migration; Zod contracts; Express 5 with security middleware; in-memory image pipeline |
| **Oct 31** | Live AI pipeline | Muse Spark over Chat Completions with grounding boxes; SAM 3.1 concept prompts; fallback ladder; live fixtures for the sample images |
| **Oct 31** | Ship it | Render blueprint, Vercel config, post-deploy smoke test, CI with gitleaks |
| **Oct 31** | Product UI | Assessment flow, hazard overlay, action plan, contact button, privacy notice, share link, household views |
| **Oct 31 – Nov 1** | Reach & polish | Spanish/Portuguese/English UI **and** model output; camera button; light/dark themes; lazy-loaded chunks |
| **Nov 1** | UX iteration | Tappable markers, undoable fixes, staged progress, photo preview, room filter, materials list per fix |
| **Nov 1** | SAM masks | Mask decoding with `@meta-sam/parser` → outline polygons; markers kept inside the photo and apart |
| **Nov 1** | Floor share | Spark flags floor-level hazards, SAM segments the floor, and each card shows the % of visible floor the hazard covers |

---

## 3. Definition of done (MVP)

- [x] A user uploads a room photo and gets hazards with severity, plain-language fixes, materials and rough costs
- [x] Hazards outlined on the photo with SAM 3.1, with graceful fallback to boxes
- [x] Action plan ordered by severity, with resolve/undo, progress and room filter
- [x] Quick-contact button (call / WhatsApp / SMS, optional location) with validated phone numbers
- [x] **Both** Muse Spark and SAM 3.1 in the live path through the Meta Model API
- [x] No photos stored; household token flow; data deletable on demand
- [x] Fallback ladder always shows a banner when a result is not live
- [x] Deployed, kept warm, smoke test passing
- [x] README with problem, solution, architecture, setup, limitations and provenance
- [ ] 3-minute demo video recorded with live calls

---

## 4. Scope management

Features were prioritized against the judging criteria. When time ran short, scope was cut from the top of this list first:

| Order | Candidate to cut | Status |
|---|---|---|
| 1 | Voice check-in (Muse Voice Transcribe) | **Cut**: moved to the roadmap |
| 2 | Room caps, token revoke UI, deletion polish | Shipped |
| 3 | Plan extras (progress bar, totals, filters) | Shipped |
| 4 | Fixture hash matching (generic samples only) | Shipped |
| 5 | Location sharing in the contact button | Shipped (opt-in) |

**Never cut:** the live Spark → SAM flow, the overlay, the banner for non-live results, the security baseline, the demo video.

---

## 5. Roadmap

| Horizon | Item | Why |
|---|---|---|
| Next | **Reference price table** for common materials, by country | Grounds the model's rough costs |
| Next | **Local currency display** | USD is a placeholder for the region |
| Next | **Voice check-in** with Muse Voice Transcribe | A low-effort way for older adults to report near-falls |
| Later | **Before/after comparison** of the same room | Shows progress visually and confirms fixes |
| Later | **Partnerships** with hardware stores, clinics and municipal elder-care programs | A distribution channel and a sustainability model |
| Later | **Self-hosted open-weight models** (Muse Spark Open) | Full data residency for institutional partners |
| Later | Job queue and result caching | Scale beyond synchronous analysis |

---

## 6. Workflow and tooling

| Area | Practice |
|---|---|
| Commits | Conventional Commits in English (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`); small and frequent; history never rewritten |
| Branching | `main` for a solo developer; short-lived branches only for risky experiments |
| Quality gates | TypeScript strict, ESLint, Prettier, Vitest (server + client); all run in GitHub Actions on every push, plus a `gitleaks` scan |
| Testing | Contract tests for Spark output, Spark ↔ SAM matching, mask decoding, the fallback ladder, image validation, household scoping, rate limits; PGlite gives an in-memory Postgres |
| Release | Push to `main` → Vercel and Render deploy → `npm run smoke-test -- https://<api-url>` |
| Fallback data | `npm run record-fixture -w server -- <image> <room_type> [es\|pt\|en]`, written only from live calls |

Sample commit subjects from this project:

```
feat(ai): wire muse spark via chat completions with grounding boxes
feat(ai): segment hazards with sam 3.1 concept prompts
feat(ai): outline hazards with sam 3.1 masks
fix(ui): keep hazard markers inside the photo and apart
ci: add checks and gitleaks secret scan
```
