# Project Context

> Why aegis-home exists, who it is for, how it differs from existing tools, and how it fits the Meta Global AI Developer Hackathon 2026.

**Related:** [Architecture](ARCHITECTURE.md) · [AI integration](AI_INTEGRATION.md) · [Security](SECURITY.md) · [Development log](DEVELOPMENT_PLAN.md)

---

## 1. One-line pitch

A Spanish-first web app for Latin American families that turns photos of an older adult's home into a **visual, prioritized, locally-costed fall-prevention plan**, with hazards outlined on the photo, progress tracking, and a quick-contact button.

---

## 2. The problem

- Falls are the second leading cause of unintentional injury deaths worldwide, and adults over 60 suffer the most fatal falls ([WHO](https://www.who.int/news-room/fact-sheets/detail/falls)). Many are caused by fixable things at home: wet floors, loose rugs, cables, poor lighting, missing grab bars.
- A professional home-safety assessment requires an **in-person visit** that most families in Central America cannot easily get.
- The digital tools that do exist are **English-first, US-priced** and recommend products that are not sold locally.
- The person who worries is often **not in the house**: an adult child or grandchild in another city or country.

---

## 3. Users

| User | Need | What aegis-home gives them |
|---|---|---|
| **Primary:** adult child or grandchild, often remote | Know what is risky in a parent's home and what to do about it, cheaply | Photo → outlined hazards → plan with materials and rough costs |
| **Secondary:** the older adult | Simple, respectful guidance in their own language | Plain Spanish, Portuguese or English; no account; large tap targets |
| **Shared:** relatives helping with fixes | Coordinate who fixes what | A private share link and a "Ya lo arreglé" tracker |

---

## 4. Scope and positioning

| aegis-home **is** | aegis-home **is not** |
|---|---|
| A prevention tool for **environmental** hazards | Medical advice, diagnosis or a health tool |
| A shortcut to the family's own contacts | An emergency, monitoring or dispatch service |
| A browser app with no account | A native app, a camera system or a wearable |
| Honest about uncertainty (confidence, labeled fallbacks) | A guarantee that a home is safe |

---

## 5. Market landscape and differentiation

A search on **Oct 28, 2026** found that photo-based home-safety tools exist, but mostly in English and built for the US market.

| Category | Examples | Notes |
|---|---|---|
| Prevention from photos/video | SafeHome AI, DwellSafe, myAccessibleHome, Prev.ai, CiceroLogic, an NYU capstone | English-first, US pricing; one-off reports; some require clinician review or payment |
| Fall-risk assessment | AVA (NIH-funded) | Gait and balance from video; assesses the person, not the home |
| Fall detection | Kami Vision, D-Link DCS-8610, SafelyYou, Inspiren | Cameras and sensors; reacts after a fall, a different market |

**Where aegis-home is different** (our assessment):

| Differentiator | Detail |
|---|---|
| **Built for Latin America** | Spanish-first, plus Portuguese; low-cost materials available in Central America |
| **Visual evidence** | SAM 3.1 outlines each hazard on the family's own photo |
| **Follow-up, not a PDF** | A living action plan with progress, undo, room filter and sharing |
| **Privacy-first** | No photo storage, no account, contacts stay on the device |
| **Zero barrier** | Free, runs in any browser, a working result in about a minute |

---

## 6. Why Spanish, Portuguese and English

| Language | Rationale |
|---|---|
| **Spanish (default)** | The primary audience: families in Central America and the wider Spanish-speaking region |
| **Portuguese** | **Brazil has the largest older-adult population in Latin America** (~32 million people aged 60+, IBGE Census 2022), so supporting it widens the reach across the region at almost no marginal cost |
| **English** | Bilingual and diaspora families, and reviewers; the app follows the browser language |

The model itself writes the hazard descriptions, fixes and materials in the selected language. The UI strings are not the only thing translated.

---

## 7. Hackathon fit

| | |
|---|---|
| **Event** | Meta Global AI Developer Hackathon 2026 (building period Oct 27 – Nov 4, 2026) |
| **Track** | Indie Developer |
| **Problem statement** | *Build for Your World*: a problem the builder knows firsthand, in their own language and region |
| **Meta models** | Muse Spark 1.3 and SAM 3.1 through the Meta Model API, both in the live path |

### How the project addresses the judging criteria

| Criterion | How aegis-home addresses it |
|---|---|
| **Impact** | A widespread, underserved problem; actionable output for families who cannot get an in-person assessment |
| **Use of Meta AI tooling** | Two models in a grounded pipeline: Spark explains, SAM outlines, joined by IoU and mask decoding |
| **Demo** | Very visual: photo → outlined hazards → plan, working live on real photos |
| **Technical depth** | Constrained decoding + Zod contract, fallback ladder, privacy by design, tests and CI |

### Compliance with the event rules

| Rule | How it is met |
|---|---|
| Public repository | This repository is public |
| New work only | All code was written during the building period; see the commit history and the [README provenance section](../README.md#built-during-the-hackathon) |
| No AI medical advice | Environmental hazards and environmental fixes only, enforced in the prompt and stated in the UI |
| Not a "simple image analyzer" | Multi-model pipeline with instance matching, mask outlines, a persistent plan and follow-up |
| Rights to assets | Sample images are AI-generated for this project; no third-party photos |

---

## 8. Glossary

| Term | Meaning |
|---|---|
| **Muse Spark** | Meta's multimodal reasoning model; used here for vision |
| **SAM 3.1** | Meta's Segment Anything Model; returns boxes and masks for a concept prompt |
| **Concept prompt** | A short noun phrase (e.g. `"loose rug"`) that tells SAM what to segment |
| **Meta Model API** | Meta's hosted, OpenAI-compatible API for Muse models and SAM |
| **Household token** | An unguessable UUID that identifies a household; sent in `X-Household-Token` |
| **Normalized image** | The server-resized photo (longest side 1024 px) that both models see |
| **Normalized coordinates** | Regions stored as 0–1 fractions of the normalized image |
| **Fixture** | A recorded **real** model result, used by the fallback ladder |
| **IoU** | Intersection over Union; the overlap score used to match SAM instances to Spark's box |

---

## 9. Sources

- World Health Organization, *Falls* fact sheet: <https://www.who.int/news-room/fact-sheets/detail/falls>
- IBGE, *Censo Demográfico 2022*: population aged 60 and over in Brazil
- Meta Global AI Developer Hackathon Participant Guide and Official Rules
- Market landscape (searched Oct 28, 2026): AgeInPlaceTech, NewsBytes, App Store, AI Home Building, NIH/FindATrial, Hacker News, Gust, IAmALS, Albuquerque Journal, D-Link press releases, TechBullion, YesPress, MedCity News
