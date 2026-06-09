# Time Capsule

![ci](https://github.com/Bobbygkmc/time_capsule/actions/workflows/ci.yml/badge.svg)
![license](https://img.shields.io/badge/license-Proprietary-red)
![next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![typescript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

![Time Capsule — a glimpse](docs/screenshots/hero.png)


A platform for creating digital time capsules — messages, photos, videos, and other mementos locked until a specified unlock date, then optionally delivered to chosen recipients.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind + shadcn/ui
- tRPC v11
- Prisma → Supabase Postgres
- Supabase Auth (SSR cookies) + Storage + Vault
- Upstash Redis (Rate Limiting)
- Resend for email
- Vercel hosting + Vercel Cron for unlock scheduling

## Local development

    git clone https://github.com/Bobbygkmc/time_capsule.git
    cd time_capsule
    cp .env.example .env.local   # populate keys
    npm install
    npx prisma generate
    npx prisma migrate dev
    npm run dev

App runs at http://localhost:3000.

## Environment variables

See `.env.example`. Required at minimum:

- `DATABASE_URL` — Supabase Postgres pooled connection
- `DIRECT_URL` — Supabase Postgres direct connection (for migrations)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET` — shared secret for the unlock cron endpoint

## Deploy

Push to `main`. Vercel auto-deploy. Cron schedule lives in `vercel.json`.

## Documentation

- `docs/PLAN.md` — phased build plan (Refined v2)
- `docs/ARCHITECTURE.md` — system design
- `docs/DATA_MODEL.md` — schema reference
- `docs/SECURITY.md` — threat model, encryption, RLS (TBD Phase 5)
- `docs/RUNBOOK.md` — operations (TBD Phase 9)
- `docs/API.md` — tRPC procedure reference (TBD Phase 9)

## License

Proprietary — Blue Garnet Ventures LLC.
