# Time Capsule

A platform for creating digital time capsules — messages, photos, videos, and other mementos locked until a specified unlock date, then optionally delivered to chosen recipients.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind + shadcn/ui
- tRPC v11
- Prisma → Supabase Postgres
- Supabase Auth (SSR cookies) + Storage
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
- `CRON_SECRET` — shared secret for the unlock cron endpoint

## Deploy

Push to `main`. Vercel auto-deploys. Cron schedule lives in `vercel.json`.

## Documentation

- `docs/PLAN.md` — phased build plan
- `docs/ARCHITECTURE.md` — system design
- `docs/DATA_MODEL.md` — schema reference
- `docs/SECURITY.md` — threat model, encryption, RLS
- `docs/RUNBOOK.md` — operations
- `docs/API.md` — tRPC procedure reference

## License

Proprietary — Blue Garnet Ventures LLC.
