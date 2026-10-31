# aegis-home

A Spanish-first web app for Latin American families that turns photos of an older adult's home into a **visual, prioritized, locally-costed fall-prevention plan**.

Built for the **Meta Global AI Developer Hackathon 2026** · Indie Developer track · _Build for Your World_.

> 🚧 Work in progress (Oct 27 – Nov 4, 2026).

## How it works

1. A family member photographs the rooms of the home.
2. **Muse Spark** (vision) identifies visible environmental fall hazards, their severity, a fix in simple Spanish and a rough local cost.
3. **SAM 3.1** segments each hazard so it is highlighted on the photo.
4. The app builds an action plan ordered by severity, with progress tracking and a quick-contact button (call / WhatsApp / SMS).

Photos are processed in memory and never stored.

## Not medical advice

aegis-home reports **environmental** hazards only. It does not diagnose conditions, give health advice, detect falls, or act as an emergency or monitoring service.

## Stack

React + Vite + Tailwind (TypeScript) · Node.js + Express 5 (TypeScript) · PostgreSQL (Neon) + Prisma · Zod · Meta Model API (Muse Spark, SAM 3.1) · Vercel · Render.

## Local development

Requires Node.js 22.12+.

```bash
npm install
cp .env.example server/.env   # fill in DATABASE_URL; keep MOCK_AI=true until the Meta API is wired
npm run db:deploy -w server
npm run dev:server            # http://localhost:3000
npm run dev:client            # http://localhost:5173
```

Checks: `npm run typecheck`, `npm run lint`, `npm test` (API tests run against an in-memory Postgres).

## Deployment

| Part       | Host                      | Config                                                                                           |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| API        | Render (free web service) | [`render.yaml`](render.yaml) — build runs migrations; health check `/health`                     |
| Frontend   | Vercel                    | Root directory `client`; [`client/vercel.json`](client/vercel.json) sets CSP and privacy headers |
| Database   | Neon Postgres             | `DATABASE_URL` with `sslmode=verify-full`                                                        |
| Keep-alive | UptimeRobot               | `GET /health` every 5 minutes                                                                    |

After each deploy: `npm run smoke-test -- https://<api-url>`.

## Documentation

- [Context](docs/CONTEXT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [AI integration](docs/AI_INTEGRATION.md)
- [API specs](docs/API_SPECS.md)
- [Security](docs/SECURITY.md)
- [Development plan](docs/DEVELOPMENT_PLAN.md)

## Provenance

All code in this repository was written during the hackathon (Oct 27 – Nov 4, 2026). Reused code from earlier work: none.
