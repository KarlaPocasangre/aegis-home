# CONTEXT

> Single-file briefing on **the contest** (Meta Global AI Developer Hackathon 2026) and **the project** (**aegis-home**, earlier working title *Paso Seguro*). Written to onboard a reviewer or contributor quickly.
> Last updated: **Sat Oct 31, 2026.** Time left until the submission deadline at the time of writing: ~4 days.

Related documents: [ARCHITECTURE.md](ARCHITECTURE.md) · [DATA_MODEL.md](DATA_MODEL.md) · [AI_INTEGRATION.md](AI_INTEGRATION.md) · [API_SPECS.md](API_SPECS.md) · [SECURITY.md](SECURITY.md) · [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)

**Reliability legend used below**
- ✅ **Confirmed** — stated in the official *Participant Guide* or *Official Rules* (Terms & Conditions and Event Waiver).
- 🟡 **Secondary** — reported by secondary sources (press, community repos, Discord summaries); not confirmed officially.
- ⚠️ **VERIFY** — unknown or inconsistent; check the portal / `dev.meta.ai/docs` before relying on it.

---

# PART 1 — THE CONTEST

## 1.1 What it is

| | |
|---|---|
| Name | Meta Global AI Developer Hackathon 2026 ✅ |
| Organizers | Meta Platforms, Inc. and Cerebral Valley Enterprises, Inc. (plus partners) ✅ |
| Format | 100 % virtual ✅ |
| Platform | Cerebral Valley portal (`cerebralvalley.ai/e/meta-ai-developer-hackathon`); **not** Devpost ✅ |
| Community | Hackathon Discord (channels: #general, #announcements, #intros, #team-search, #questions, #office-hours) ✅ |
| Capacity | Max 20,000 accepted participants ✅ |
| Prize pool | $1,000,000 USD (anticipated) ✅ |
| Applications | Closed Oct 25, 2026 at 11:59 PM ET; only accepted participants can submit ✅ |
| Building period | **Oct 27 – Nov 4, 2026** ✅ |

## 1.2 Key dates (the guide uses Eastern Time; El Salvador is UTC-6)

US daylight saving time ended **Nov 1**, so the gap to El Salvador is 2 h until Nov 1 and **1 h from Nov 2**.

| Event | ET | El Salvador |
|---|---|---|
| Kickoff livestream (Mon Oct 26) ✅ | 12:00 PM | 10:00 AM |
| Live sessions: Agents 101 (Oct 27), Agents 102 (Oct 28), Fireworks open-models (Oct 30) ✅ | 12:00–12:30 PM | passed |
| Discord office hours (weekdays, text only, no video) ✅ | 10–11 AM | 9–10 AM from Mon Nov 2 |
| **Tue Nov 3** — last full day for submission questions and technical troubleshooting ✅ | all day | all day |
| **Wed Nov 4 — SUBMISSION DEADLINE + last day to claim Meta credits + final office hours** ✅ | **9:00 PM** | **8:00 PM** |
| Judging period (Thu Nov 5 – Sun Nov 8) ✅ | | |
| Closing ceremony: top 10 announced (5 per track), live final-round judging, winners, community vote opens (Mon Nov 9) ✅ | 12:00 PM | 11:00 AM |
| Bonus prizes announced "on or about" Nov 10 ✅ (Rules) | | |
| Community-vote winner announced on Discord (Mon Nov 16) ✅ | | |

**Late submissions are not considered.** ✅ Internal target for this project: submit by **Wed Nov 4, 12:00 PM El Salvador**.

## 1.3 Tracks, themes, and what judges look for

**Tracks** ✅ — a person applies to one track and a project is entered in one track only.
- **Indie Developer** — individual builders and students; teams of up to 4. *(This project.)*
- **Startup** — technical founders building a product; the Representative must be an active employee of the startup.

**Problem statements** ✅ — the project must build toward one of them:
- **Build for Your World** — bring Meta's models into your domain; solve a problem you know firsthand; free up time and mental space; make possible something that wasn't before. *(This project.)*
- **Push the Frontier** — challenges in software, robotics, manufacturing, energy, materials and beyond.

**The project must incorporate Meta's models** ✅:
- Via Meta Model API: Muse Spark series, Muse Wonder, Muse Image, Muse Voice Transcribe, SAM 3.1.
- Open weights: Muse Glimmer, Muse Spark Open.
- Coding agent: Muse Code.

## 1.4 Judging

**Three stages** ✅
1. **Pass/fail viability:** the project reasonably fits a theme **and** reasonably used Meta Model API and/or Meta open-weight models to build the project during the hackathon.
2. **Scored 0–10 on the rubric** (all passing submissions).
3. **Final round:** top 5 per track; final-round judges watch the video demos live and rank with the same rubric.

**Rubric weights (Official Rules)** ✅

| Criterion | Weight | What it rewards |
|---|---|---|
| **Impact** | 30 % | Real-world potential, who benefits and how much it matters, whether people could use it, fit with a problem statement |
| **Use of Meta AI tooling** | 25 % | Creative use, going beyond a basic integration, surfacing unexpected capabilities |
| **Demo** | 25 % | Working, impressive demo; holds up live; quality of the demo video |
| **Technical depth & execution** | 20 % | Sound, thoughtfully refined engineering; real craft |

⚠️ VERIFY: some community sources claim equal weights; the Official Rules (a contract) state 30/25/25/20. The rubric table inside the Participant Guide was not visible in the text reviewed.

Judges are chosen by the organizers; their decisions are final. 🟡 No judge names were published in the sources reviewed.

## 1.5 Rules that shape the project

✅ **Hard rules (Participant Guide)**
- Repositories **must be public**.
- Max **4 people** per team; solo allowed. One project per team (not per person); a **Representative** submits and must list everyone who worked on it.
- The demo **must only highlight what was built during the hackathon**; judges must be able to clearly identify the original contribution, or the project is **immediately disqualified** (judges' sole discretion).
- **New work only** — what is presented must have been built during the event. Startups may build on existing products if the new work is clearly identified.
- **Banned projects:** those that violate legal, ethical or platform policies, or use code/data/assets you have no rights to.
- Late submissions are not considered.

✅ **Submission requires** (Participant Guide)
- Submit at `cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit`.
- A **3-minute demo video** highlighting what was built during the hackathon; it is one of the primary artifacts judges use, together with the code and the live product.
- Double-check: repo is publicly accessible, video link opens, everyone is listed.

✅ **Anti-projects to avoid** (examples; list is not exhaustive)
- Any project using AI to **generate and give medical advice** (e.g., AI mental-health advisor, skin-blemish detector)
- Basic RAG applications
- Simple image analyzers
- Simple "AI for Education" chatbots
- AI job-application screener
- AI nutrition coach
- Personality analyzers
- Sports analyzers or coaches
- Anything political or involving war

✅ **Eligibility (Official Rules)**
- 18+ and age of majority in the place of residence.
- Not eligible: sanctioned persons/entities; persons or organizations organized or located in Belarus, China, Russia, Ukraine, Syria, Crimea, Donetsk, Luhansk, Cuba, North Korea, Iran; Meta/Cerebral Valley employees, contractors, interns; "government-affiliated individuals"; their immediate families and household members. ⚠️ VERIFY the meaning of "government-affiliated" if it could apply to you.
- El Salvador is not on the exclusion list.
- 🟡 Meta Model API separately restricts some territories (e.g., Venezuela, Nicaragua, Haiti) and forbids using technical measures to bypass geographic controls.

✅ **IP, data and legal (Official Rules)**
- You **keep ownership** of your submission.
- By submitting you grant the organizers (and partners) a **perpetual, irrevocable, worldwide, royalty-free, non-exclusive license** to use, modify, publish and exploit it for any purpose, including marketing.
- **Nothing shared at the event is confidential** (ideas, code, pitches, feedback). Recordings belong to the organizers.
- Winners' name and likeness may be used in publicity. Participant data may be shared with organizers/sponsors for marketing.
- Submission must be original and owned by you; open-source components are allowed if their licenses are followed and your work builds upon them; third-party technical help is allowed if the components remain your own.
- Governing law: California; venue: San Francisco courts. Broad liability waiver and indemnification apply.

## 1.6 Prizes (USD) ✅

| Place | Indie Developer ($400,000) | Startup ($550,000) |
|---|---|---|
| 1st | 150,000 | 250,000 |
| 2nd | 100,000 | 150,000 |
| 3rd | 75,000 | 75,000 |
| 4th | 50,000 | 50,000 |
| 5th | 25,000 | 25,000 |

- **Bonus prizes:** up to $50,000 in aggregate (e.g., community vote, most viral project, other notable categories); announced around Nov 10.
- **Payout (Official Rules):** administered by Cerebral Valley; paid in USD via a payout provider (currently Tremendous, bank option); winners enter bank details directly with the provider. Before payment: eligibility verified, waiver and rules signed, **W-9 (US residents) or W-8BEN (non-US)**. Paid within 30 days after verification and documentation. Winners bear wire/FX fees and all applicable taxes, and are responsible for banking and tax compliance in their jurisdiction.
- A participant is not a winner until eligibility is verified and they are notified.

## 1.7 Resources provided ✅

- **Meta Model API credits:** $150 per accepted participant, valid for the 10-day window. Claim via the official form **by Nov 4, 9:00 PM ET**; each person claims their own. Credits are distributed in batches; check the Billing page. A **credit card is required** to make API calls (a temporary pre-authorization appears and is released in a few business days). A "Spend Limit" **notification** can be set on Billing — 🟡 reported not to stop charges.
- **Docs:** `dev.meta.ai/docs` (Overview, Quickstart, Model list); **Cookbooks:** `meta-models/meta-model-cookbook` (API fundamentals, Muse Code recipes) and `meta-models/meta-oss-cookbook`.
- **Inference partners** (not guaranteed; at each partner's discretion):
  - **Baseten** — $100 + 2M TPM, up to 2,000 participants, reviewed by use case, per individual. For the hackathon use model `meta-models/muse-spark-open-1026` (not the name in Baseten's docs).
  - **Modal** — $100 for the first 1,000 participants (open-weight models via Endpoints, serverless GPUs, sandboxes).
  - **Fireworks** — $100 for a shortlist of selected teams, reviewed with Fireworks.
- 🟡 Reported pricing for Muse Spark and a data-sharing "Contributor" mode in which Meta may train on prompts/code — ⚠️ VERIFY which mode your account uses (this project sends photos of home interiors).

---

# PART 2 — THE PROJECT

## 2.1 One-line pitch

A Spanish-first assistant for Latin American families that turns photos of an older adult's home into a **visual, prioritized, locally-costed fall-prevention plan**, with follow-up and a quick-contact button.

## 2.2 Problem and users

- Falls are a leading cause of injury among older adults; most home-safety assessments require an in-person visit by a professional. (Cited by US sources; use local statistics in the final README after verifying.)
- **Primary user:** an adult family member (caregiver) assessing a parent's or grandparent's home, often remotely.
- **Secondary user:** the older adult themselves.
- **Context:** Spanish-speaking households in Central America / Latin America; typical housing and low-cost local materials.

## 2.3 Core features (MVP)

1. Upload photos per room (bathroom, kitchen, stairs, hallway, etc.).
2. **Muse Spark** (vision) identifies visible environmental fall hazards, severity, a fix in simple Spanish and a rough cost.
3. **SAM 3.1** segments each hazard; the UI highlights it on the photo.
4. **Action plan** ordered by severity, with resolve/undo tracking and cost totals.
5. **Quick-contact button:** call / WhatsApp / SMS (with location) to the user's own contacts via native phone links.
6. Privacy by design: photos processed in memory and never stored; households expire and can be deleted.

*Stretch:* Spanish voice check-in (Muse Voice Transcribe).

## 2.4 Explicit non-goals and positioning

- **Not medical advice or diagnosis.** Environmental hazards and environmental fixes only. This keeps the project clear of the "AI medical advice" anti-project.
- **Not an emergency or monitoring service.** The contact button is a shortcut; it does not detect falls, dispatch help or guarantee a response.
- **Not a fall detector.** Detection is a crowded hardware/camera market; this project does prevention.
- No accounts/login, native mobile app, model training, or hardware in the MVP.

## 2.5 Why it fits the contest

| Criterion | How the project addresses it |
|---|---|
| Theme | *Build for Your World* — a problem close to home, in the builder's language and context |
| Impact (30 %) | Real, widespread problem; Spanish/LatAm underserved; actionable output for families |
| Meta tooling (25 %) | Two Meta models cooperating (Spark → SAM) rather than a thin wrapper; optional voice |
| Demo (25 %) | Highly visual: photo → highlighted hazards → plan; reproducible with own photos |
| Technical depth (20 %) | Sequential AI pipeline with a validated contract, fallback ladder, security hardening, tests |
| Stage-1 viability | Genuinely uses Meta Model API in the live path |

**Main risk:** being judged as a generic "simple image analyzer". Mitigation: the differentiators in §2.6, the Spark→SAM visual overlay, follow-up plan, and a clear demo narrative.

## 2.6 Market landscape and differentiation

A search on **Oct 28, 2026** found that this product category already exists, mostly in English and priced/contextualized for the US:

**Prevention from photos / video**
- **SafeHome AI** — consumer web app launched Jul 25, 2026; photos → ranked hazard report with fixes and cost estimates; free for two rooms, $19.99 one-time for up to eight; built by a physical therapist.
- **DwellSafe** — AI home scans with clinician review and contractor connections; launched Oct 2025.
- Others: an NYU capstone (room-photo analysis with PDF report), CiceroLogic, Prev.ai, myAccessibleHome (for occupational therapists).
- **AVA** (NIH-funded) — fall-*risk* assessment from gait/balance via smartphone video, on-device; positioned as assessment, not diagnosis.

**Fall detection (not our market)**
- Kami Vision (camera-based, subscription), D-Link DCS-8610 (AI fall-detection camera, Jul 2026), SafelyYou (senior-living cameras), Inspiren (raised a $70M Series C).

**Gaps this project targets (our inference, not a market-research finding)**
1. **Spanish-first, Latin American context** — housing types, materials and costs.
2. **Visual evidence** — SAM-based highlighting on the user's own photo.
3. **Follow-up** — an action plan with progress tracking, not a one-off PDF.
4. **Privacy-first** — no photo storage; clear consent notice.
5. **Low barrier** — no account, shareable link, works in a browser.

## 2.7 Stack at a glance

React + Vite + Tailwind (TypeScript) · Node.js + Express 5 (TypeScript) · PostgreSQL + Prisma · Zod · multer (memory) + sharp + file-type · Meta Model API (Muse Spark, SAM 3.1) · Vercel (frontend) · Render (backend) · UptimeRobot keep-alive.
Details: [ARCHITECTURE.md](ARCHITECTURE.md).

## 2.8 Key decisions already made

- Modular monolith + REST; stateless backend; no accounts (UUID v4 household token in the `X-Household-Token` header).
- Store structured results only; **no images** stored; contacts only in `localStorage`.
- **Sequential** AI pipeline: Spark identifies → SAM segments by label → join by hazard `id`; both models receive the same normalized (1024 px) image; regions stored normalized 0–1.
- Strict Zod validation of all AI output; invalid output is a provider fault (retry once, then fallback), not a client error.
- Fallback ladder (live → cached real fixture → generic mock) **always labeled with a visible banner**; the demo video is recorded with live calls.
- Hazard fix/cost/status live inside `Hazard` (no separate action-item table).
- Flat React components; Prisma called directly from services; server-side image sanitation (client-side is privacy only).
- Daily AI call cap persisted in the DB, because Meta's spend notification doesn't stop billing.

## 2.9 Open questions to resolve (see [AI_INTEGRATION.md §10](AI_INTEGRATION.md))

1. Meta Model API base URL, auth scheme and exact model IDs for Spark (vision) and SAM 3.1. ⚠️
2. Does SAM 3.1 accept a text label? What is its output format and coordinate space? (Decides the sequential pipeline vs. Plan B.) ⚠️
3. Is there a structured/JSON output mode for Spark? Image size limits? Rate-limit/429 format? ⚠️
4. Standard vs. "Contributor" data mode on the account. ⚠️
5. Render free-tier hours and database expiry; choose Neon/Supabase if needed. ⚠️
6. Does the "prevention + Spanish-first" angle fit *Build for Your World* and avoid the anti-project list? Ask in #office-hours. ⚠️
7. Include the voice check-in? Decide by Mon Nov 2 based on time.

## 2.10 Status tracker (update as you go)

| Area | Status |
|---|---|
| Repo public + docs committed | ☐ |
| Credits claimed (Meta; Baseten/Modal if used) | ☐ |
| Verification checklist resolved | ☐ |
| Spark → validated JSON | ☐ |
| SAM overlay working | ☐ |
| Deployed (Render + Vercel + DB) and kept warm | ☐ |
| UI flow complete | ☐ |
| Action plan + resolve/undo | ☐ |
| Emergency-contact button | ☐ |
| Fallback ladder + banner | ☐ |
| Security "must do" checklist | ☐ |
| Demo video recorded (live calls) | ☐ |
| README + provenance section | ☐ |
| Submitted (before Nov 4, 8:00 PM El Salvador) | ☐ |

---

# Glossary

| Term | Meaning |
|---|---|
| **Muse Spark** | Meta's multimodal reasoning model (vision used here) |
| **SAM 3.1** | Meta's segmentation model (outputs masks/regions for objects) |
| **Muse Glimmer / Muse Spark Open** | Meta open-weight models |
| **Meta Model API** | Meta's hosted API for Muse models and SAM |
| **Representative** | The team member who submits and receives notices/prizes |
| **Household token** | Unguessable UUID that identifies a household; sent in `X-Household-Token` |
| **Normalized image / coordinates** | Server-resized image (longest side 1024 px); regions stored as 0–1 fractions |
| **Fixture** | Recorded real AI response used by the fallback ladder |
| **ET** | US Eastern Time (UTC-4 until Nov 1, UTC-5 after); El Salvador is UTC-6 |

# Sources

Primary: Meta Global AI Developer Hackathon **Participant Guide** and **Hackathon Terms & Conditions ("Official Rules") and Event Waiver** (as provided by the participant). Public pages: `dev.meta.ai/events/global-hackathon` and `cerebralvalley.ai/e/meta-ai-developer-hackathon`.
Market landscape (searched Oct 28, 2026): AgeInPlaceTech (SafeHome AI; Kami Fall Detect), NewsBytes (SafeHome AI), App Store (DwellSafe), AI Home Building (DwellSafe), NIH/FindATrial (AVA), HN Showcase (NYU capstone), Gust (CiceroLogic), IAmALS (Prev.ai), Albuquerque Journal (myAccessibleHome), D-Link/AAP press releases (DCS-8610), TechBullion (Kami Vision), YesPress (SafelyYou), MedCity News (Inspiren).
