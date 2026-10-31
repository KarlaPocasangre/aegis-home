# DEVELOPMENT_PLAN

Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [AI_INTEGRATION.md](AI_INTEGRATION.md) · [SECURITY.md](SECURITY.md)

**Hard deadline: Wed Nov 4, 2026, 9:00 PM ET = 8:00 PM El Salvador (UTC-6).** Late submissions are not considered. Target: **submit by Wed Nov 4, 12:00 PM El Salvador.**

Judging weights (Official Rules; ⚠️ one source said equal weights — confirm in the portal): Impact 30 % · Use of Meta AI tooling 25 % · Demo 25 % · Technical depth & execution 20 %. Everything below is ordered to protect those.

## 1. Principles

1. **Vertical slice first:** one real image through Express → Muse Spark → screen, before any structure is polished.
2. **Deploy early:** a working "hello world" in production by Fri Oct 30.
3. **One flow that works perfectly** beats many half-built features.
4. **Everything built during the event** (Oct 27 – Nov 4), visible in the commit history.
5. **The demo video is 25 % of the score** — it gets real time, not leftovers.

## 2. Day-by-day plan (El Salvador time)

| Day | Goal | Done when |
|---|---|---|
| **Wed Oct 28 (tonight)** | Claim Meta $150 credits; request Baseten/Modal credits if wanted (limited spots); create the **public** repo with `.gitignore`, `.env.example`, README stub, these docs; ask in Discord / office hours if the "prevention + Spanish-first" angle fits *Build for Your World* | Repo public, first commits pushed, credits requested |
| **Thu Oct 29** | Resolve the **verification checklist** in AI_INTEGRATION §10; Express skeleton; one hardcoded image → Muse Spark → validated JSON; fix the Spark contract and prompt | Real Spark response parsed by Zod; SAM input format known |
| **Fri Oct 30** | Spark → SAM sequential pipeline with normalized coords; Prisma schema + migrate; **deploy** backend (Render) + frontend (Vercel) with CORS, env vars, DB; UptimeRobot on `/health` | Deployed hello-world + one live analysis from the deployed URL |
| **Sat Oct 31** | React UI: uploader, canvas resize/EXIF strip, results view, overlay drawing | Full flow works in the browser against the deployed API |
| **Sun Nov 1** | Action plan view + resolve/undo; evaluation set of 8–10 photos and prompt tuning; record fixtures; implement fallback ladder + banner | Plan works; fixtures recorded; fallback tested by forcing a failure |
| **Mon Nov 2** | Emergency-contact button; privacy notice; household token UX; rate limits + spend cap; security "must do" checklist; *(stretch: voice check-in)* | SECURITY must-do all checked |
| **Tue Nov 3** | **Record the 3-minute demo video with live calls**; README + architecture diagram; ask remaining questions in Discord (last full support day); smoke test; `npm audit` | Video recorded; README complete |
| **Wed Nov 4** | Final fixes only; dry run; **submit by noon**; verify repo is public, video link opens, all members listed | Submission confirmed |

Buffer rule: if a day slips, cut per §4 — don't slip the video.

## 3. Definition of done (MVP)

- [ ] User uploads a room photo (or several) and receives hazards with severity, Spanish fixes and cost estimates
- [ ] Hazards highlighted on the photo (SAM 3.1) with graceful behavior when a region is missing
- [ ] Action plan ordered by severity with resolve/undo
- [ ] Emergency-contact button (call / WhatsApp / SMS + location) with validated phone numbers
- [ ] Uses **both** Muse Spark and SAM 3.1 through Meta Model API in the live path
- [ ] No photos stored; household token flow works; data deletable
- [ ] Fallback ladder works and always shows a banner when not live
- [ ] Deployed, kept warm, smoke test passing
- [ ] README with problem, solution, architecture diagram, setup, limitations, provenance
- [ ] Demo video (3 min) recorded with live calls

## 4. Cut order if time runs short

Cut from the top first:

1. Voice check-in (Muse Voice Transcribe)
2. Per-household room limits, token revoke UI, data-deletion button polish
3. Polished plan view extras (progress bars, totals)
4. Fixture hash-matching (keep generic mock only)
5. Emergency button location sharing (keep plain call/WhatsApp)

**Never cut:** the Spark→SAM live flow, the overlay, the banner for non-live results, the security must-dos, the demo video.

## 5. Demo video (3 minutes) — outline

The video is a primary judging artifact and must show **only what was built during the hackathon**.

| Time | Content |
|---|---|
| 0:00–0:25 | The problem (falls at home; existing tools are English/US-centric) and who it's for |
| 0:25–1:45 | Live walkthrough: upload a real room photo → hazards highlighted → Spanish plan with costs |
| 1:45–2:15 | Mark a fix as done; show the quick-contact button; mention photos aren't stored |
| 2:15–2:45 | How Muse Spark + SAM 3.1 work together (one simple diagram) and what was built during the hackathon |
| 2:45–3:00 | Limitations (not medical advice, not an emergency service) and what's next |

Recording checklist: warm the backend 1–2 minutes before; use your own photos or ones with consent; confirm `source` is `live`; no keys, tokens or personal data on screen; check audio; link must open without login.

## 6. Submission checklist (portal: `cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit`)

- [ ] Repository **public** — open it in a logged-out window to confirm
- [ ] Video link accessible without login
- [ ] Everyone who worked on the project listed; submitted by the team Representative (solo = you)
- [ ] Track and theme selected (Indie / *Build for Your World*)
- [ ] Meta credits claimed individually before the deadline (form + billing card required)
- [ ] README states what was built during Oct 27–Nov 4 and lists any reused code
- [ ] Demo shows only new work
- [ ] If you win: be ready with a W-8BEN (non-US residents), bank details for the payout provider, and awareness of local tax/banking rules

## 7. Git workflow

- Small, frequent commits from today. **Do not squash or rewrite history** — the dates are evidence of new work.
- Conventional Commits in English: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

```
feat(server): setup express 5 app with helmet, cors and trust proxy
feat(prisma): add household, assessment, room and hazard models
feat(ai): add spark hazard detection with zod-validated contract
feat(ai): segment hazards with sam 3.1 and normalize regions
feat(ui): add image canvas overlay for hazard regions
fix(ui): strip exif by re-encoding the image before upload
chore(deps): add zod, multer, sharp and file-type
docs: add architecture and data model documents
```

- Branching: `main` only is fine for one developer; use short-lived branches only for risky experiments.

## 8. Tooling

- **Server:** Node + Express 5 + TypeScript (strict) via `tsx`, Prisma, Zod, multer (memory), sharp, file-type, helmet, cors, express-rate-limit, Vitest.
- **Client:** React + Vite + Tailwind (TypeScript), TanStack Query.
- **Quality:** ESLint + Prettier; Husky/commitlint skipped on purpose.
- **Tests (small):** Zod contract, Spark↔SAM matching by id, fallback behavior, deployed smoke test.
- **Time budgets (max):** scaffolding/linters/Prisma 2–3 h · tests 1–2 h · first deployment 1–2 h.

## 9. README outline

1. One-line pitch + screenshot/GIF
2. Problem and who it helps
3. How it works (Muse Spark + SAM 3.1) with the Mermaid diagram from ARCHITECTURE.md
4. Features
5. Tech stack
6. Setup and environment variables (`.env.example`)
7. How to run tests and the smoke test
8. Security and privacy summary + honest limitations
9. What was built during the hackathon (provenance)
10. Links to the docs in this folder
