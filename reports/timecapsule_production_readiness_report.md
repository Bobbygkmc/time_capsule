# TimeCapsule — Production Readiness Report

**Target URL:** https://timecapsule.uyammadu.com  
**Branch reviewed:** `claude/timecapsule-production-readiness-0MYa5`  
**App root:** `time-capsule/` (Next.js 15.5, React 19, Prisma 6, Supabase Auth, tRPC 11, Resend)  
**Date:** 2026-05-23  

---

## Executive Summary

The app builds cleanly, typechecks with zero errors, and the standalone server
passes all smoke tests. **Four blocking issues were found and fixed in this
branch.** One non-blocking housekeeping item (tracked generated artifacts)
requires a follow-up commit approved by Bob.

---

## Issues Found and Fixed

### 1. ❌ → ✅ Hardcoded `yourdomain.com` email sender

**File:** `time-capsule/src/lib/email.ts:7`  
**Severity:** Blocking — Resend rejects mail from unverified domains.

Before:
```typescript
from: "Time Capsule <noreply@yourdomain.com>",
```

After:
```typescript
from: `Time Capsule <noreply@${new URL(process.env.NEXT_PUBLIC_APP_URL!).hostname}>`,
```

Derives the sender domain from `NEXT_PUBLIC_APP_URL` at runtime (e.g. `noreply@timecapsule.uyammadu.com`).

---

### 2. ❌ → ✅ Module-level `Resend` instantiation crashes build

**File:** `time-capsule/src/lib/email.ts` (discovered during build)  
**Severity:** Blocking — `next build` failed with `Missing API key` during route collection; production server would also crash on cold start if `RESEND_API_KEY` is absent.

Fixed by making the `Resend` instance lazy (created inside `sendUnlockEmail`), so it only runs when the function is called.

---

### 3. ❌ → ✅ `output: 'standalone'` missing from next.config.js

**File:** `time-capsule/next.config.js`  
**Severity:** Blocking — without standalone mode, the build produces a full Next.js build directory that cannot be run with a single `node server.js` command, making systemd deployment impractical.

Also added `outputFileTracingRoot: path.join(__dirname, "../")` to explicitly anchor the monorepo root and silence the "multiple lockfiles" warning. Standalone server entrypoint: `.next/standalone/time-capsule/server.js`.

---

### 4. ❌ → ✅ `.env.example` missing 8 of 9 required environment variables

**File:** `time-capsule/.env.example`  
**Severity:** Blocking — the old file only listed `DATABASE_URL` with a SQLite path, despite the schema using PostgreSQL and `src/env.js` requiring 9 variables.

Rewritten to include all required variables with comments explaining where to find each value. See `reports/production_env_checklist.md` for the full checklist.

---

### 5. ⚠️ Non-blocking: Generated Prisma artifacts tracked in git

**Path:** `generated/prisma/` (root)  
**Severity:** Non-blocking but should be cleaned up — 27 files including `libquery_engine-linux-arm64-openssl-3.0.x.so.node` (binary) and `.wasm` files add ~5 MB of generated artifacts to every clone and can cause false conflicts.

**Fix applied:** Added `generated/` to `.gitignore`.  

**Required follow-up (separate approved commit):**
```bash
git rm -r --cached generated/
git commit -m "chore: untrack generated Prisma client artifacts"
```
Do NOT run `git rm -r --cached` without explicit approval — it rewrites the index.

---

## Items Reviewed — No Changes Needed

| Item | Status | Notes |
|------|--------|-------|
| Tracked `.env` secrets | ✅ Clean | Only `.env.example` committed; `.env` is gitignored |
| Auth callback redirect | ✅ Clean | Uses `origin` from request URL dynamically |
| Middleware auth logic | ✅ Clean | Redirects unauthenticated → `/login`, authenticated on `/login` → `/dashboard` |
| Prisma schema | ✅ Clean | PostgreSQL, `DATABASE_URL` + `DIRECT_URL` (correct for Supabase pooling) |
| tRPC base URL | ✅ Clean | Browser: `window.location.origin`; SSR: `localhost` (correct for self-hosted) |
| Cron endpoint auth | ✅ Clean | Bearer token via `CRON_SECRET` env var |
| Hardcoded localhost in production paths | ✅ None | Dev fallback only |
| XSS / injection surface | ✅ Acceptable | tRPC input validated with Zod; Prisma parameterizes all queries |

---

## Build & Smoke Test Results

### Typecheck
```
$ SKIP_ENV_VALIDATION=1 npm run typecheck
✓ 0 errors
```

### Production Build
```
$ SKIP_ENV_VALIDATION=1 npm run build
✓ Compiled successfully in 15.8s
✓ Generating static pages (9/9)
✓ Standalone output produced at .next/standalone/time-capsule/server.js
```

Routes:
```
○ /           (static)
○ /login      (static)
ƒ /dashboard  (dynamic, auth-protected)
ƒ /capsules/[id]
ƒ /capsules/new
ƒ /api/cron/unlock-capsules
ƒ /api/trpc/[trpc]
ƒ /auth/callback
```

### Runtime Smoke Test
```
HOSTNAME=127.0.0.1 PORT=3030 node .next/standalone/time-capsule/server.js

✓ Ready in 360ms

GET /          → HTTP 307 Temporary Redirect → /login  ✅ (middleware auth working)
GET /login     → HTTP 200 OK, 9903 bytes               ✅ (login page serves)
```

---

## Deployment Checklist (Pre-Launch)

- [ ] All 9 env vars set in production (see `reports/production_env_checklist.md`)
- [ ] Prisma migration deployed: `npx prisma migrate deploy`
- [ ] Supabase Auth configured (see `reports/supabase_redirect_checklist.md`)
  - Site URL: `https://timecapsule.uyammadu.com`
  - Redirect URL allow-list includes `https://timecapsule.uyammadu.com/auth/callback`
- [ ] Resend domain `timecapsule.uyammadu.com` verified (DNS TXT record)
- [ ] Supabase Storage bucket `capsule-items` exists with correct RLS policies
- [ ] systemd unit installed and enabled (see `reports/systemd_service_draft.md`)
- [ ] Cloudflare Tunnel running and DNS CNAME live (see `reports/cloudflare_tunnel_ingress_draft.md`)
- [ ] Post-deploy smoke test: `curl -I https://timecapsule.uyammadu.com` → 307 → /login
- [ ] End-to-end OTP login flow tested with a real email
- [ ] Cron caller configured (external scheduler hitting `/api/cron/unlock-capsules` with `Authorization: Bearer <CRON_SECRET>`)

---

## Follow-Up Items (post-launch, separate tickets)

| # | Item | Priority |
|---|------|----------|
| 1 | Run `git rm -r --cached generated/` to untrack binary artifacts (requires approved commit) | Medium |
| 2 | Confirm Supabase Storage `capsule-items` bucket RLS policies restrict access to capsule owner only | High |
| 3 | Add a `/api/health` endpoint (returns `200 OK`) for uptime monitoring | Low |
| 4 | Consider replacing the Vercel cron pattern with a systemd timer now that we're self-hosted | Low |

---

## Deployment Docs Index

| File | Contents |
|------|----------|
| `reports/production_env_checklist.md` | All 9 env vars, where to find each, pre-flight checklist |
| `reports/supabase_redirect_checklist.md` | Supabase Auth dashboard settings and OTP redirect config |
| `reports/systemd_service_draft.md` | Draft `timecapsule.service` unit file + activation commands |
| `reports/cloudflare_tunnel_ingress_draft.md` | Draft `config.yml` for `cloudflared` + DNS setup |
| `reports/rollback_steps.md` | Deploy layout, deploy procedure, rollback procedure |
