# Production Environment Variable Checklist

All variables must be set in the server's environment (e.g. in the systemd unit's
`EnvironmentFile` or in your CI/CD secrets store) **before** starting the service.

The schema is validated at startup by `src/env.js` (`@t3-oss/env-nextjs`).
A missing or malformed variable will crash the server on boot.

---

## Required Variables

### Database (Prisma → Supabase PostgreSQL)

| Variable | Example / Format | Where to find |
|----------|-----------------|---------------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase Dashboard → Project Settings → Database → **Transaction** pooler string |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres` | Supabase Dashboard → Project Settings → Database → **Session** pooler string (port 5432) or direct connection |

> `DATABASE_URL` uses pgBouncer (port 6543) for runtime queries.
> `DIRECT_URL` is the non-pooled connection used by Prisma migrations only.

### Supabase Auth

| Variable | Format | Where to find |
|----------|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[project-ref].supabase.co` | Supabase Dashboard → Project Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (JWT) | Supabase Dashboard → Project Settings → API → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (JWT) | Supabase Dashboard → Project Settings → API → **service_role secret** — never expose client-side |

### Email (Resend)

| Variable | Format | Where to find |
|----------|--------|---------------|
| `RESEND_API_KEY` | `re_...` | resend.com → API Keys → Create API Key |

> The sender domain is derived from `NEXT_PUBLIC_APP_URL` at runtime.
> Make sure the domain `timecapsule.uyammadu.com` is verified in Resend
> (Domains → Add Domain → follow DNS steps).

### Application

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://timecapsule.uyammadu.com` | No trailing slash. Used to build capsule URLs in unlock emails and to set the email sender domain. |
| `NODE_ENV` | `production` | Controls Prisma query logging (errors only in production). |

### Cron Endpoint

| Variable | Format | Notes |
|----------|--------|-------|
| `CRON_SECRET` | random hex string | Generate: `openssl rand -hex 32`. Used as Bearer token to authenticate calls to `/api/cron/unlock-capsules`. |

---

## Pre-Flight Checks

- [ ] `DATABASE_URL` points to the **Transaction** pooler (port 6543, `?pgbouncer=true`)
- [ ] `DIRECT_URL` points to the **Session** pooler or direct connection (port 5432)
- [ ] Prisma migration has been run: `npx prisma migrate deploy` (uses `DIRECT_URL`)
- [ ] Supabase Auth is configured — see `supabase_redirect_checklist.md`
- [ ] Resend domain `timecapsule.uyammadu.com` is verified
- [ ] `CRON_SECRET` is set and recorded securely for the cron caller
- [ ] `NEXT_PUBLIC_APP_URL` matches the live production URL exactly
- [ ] `NODE_ENV=production`
