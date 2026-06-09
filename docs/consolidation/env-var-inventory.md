# TimeCapsule Consolidation — Env Var Inventory

**Date:** 2026-05-31
**Names only — no secret values are recorded here, and no `.env` values were read or modified.**

A's `.env.example` is the superset and the canonical contract. C's runtime introduced
one naming difference (`NEXT_PUBLIC_APP_URL`) that was reconciled to A's `NEXT_PUBLIC_SITE_URL`
during the port.

## Canonical variables for A (post-consolidation)

| Variable | Declared in A.env.example | Origin / notes | Consumed by (in A) |
|----------|:---:|----------------|--------------------|
| `DATABASE_URL` | ✅ | all copies | Prisma (`prisma.config.ts`, client) |
| `DIRECT_URL` | ✅ | A, C | Prisma direct connection (migrations/pooling) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | all copies | Supabase client/server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | all copies | Supabase client/server |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | all copies | server-side Supabase (storage) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | A, B | unlock-email deep links (cron route) |
| `RESEND_API_KEY` | ✅ | A, C | `src/lib/email.ts` (Resend) |
| `RESEND_FROM_EMAIL` | ✅ (added this pass) | new | `src/lib/email.ts` sender; falls back to `onboarding@resend.dev` |
| `CRON_SECRET` | ✅ | A, C | `src/app/api/cron/unlock/route.ts` bearer auth |
| `MASTER_KEK` | ✅ | A only | A's crypto boundary (`src/server/crypto/index.ts`, stubbed) |
| `UPSTASH_REDIS_REST_URL` | ✅ | A only | reserved — rate limiting (not yet implemented) |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | A only | reserved — rate limiting (not yet implemented) |

## Reconciled / dropped from C

| C variable | Resolution |
|------------|-----------|
| `NEXT_PUBLIC_APP_URL` | **Renamed** to `NEXT_PUBLIC_SITE_URL` in the ported cron route. Do not reintroduce. |
| `SKIP_ENV_VALIDATION` | C used `@t3-oss/env-nextjs` import-time validation (`src/env.js`). A does **not** use env.js (reads `process.env` directly), so this flag is unnecessary in A. |
| `NODE_ENV` | Standard; managed by Next, not declared in `.env.example`. |

## Required to actually run the unlock flow in production
- `DATABASE_URL` (+ `DIRECT_URL`) — cron queries capsules
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (verified Resend domain) — sending mail
- `NEXT_PUBLIC_SITE_URL` — building the capsule link in the email
- `CRON_SECRET` — must match the value Vercel Cron sends as `Authorization: Bearer …`

## Safety note
No values were read from any `.env`. The quarantined copy under
`_imports/from-nested-time-capsule/` deliberately **omits** C's real `.env`
(only `.env.example` retained). A's own `.env` was never opened or modified.
