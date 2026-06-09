# TimeCapsule Consolidation — Import Plan

**Date:** 2026-05-31
**Strategy:** Keep A's richer architecture; port C's *working runtime* feature-by-feature,
adapting each to A's schema and conventions. When a port conflicts with A's direction
(crypto-first items, design-shaped UI), quarantine C's code + leave a TODO instead of forcing it.

## Done in this pass (ported, build-verified)

### 1. Resend email — `src/lib/email.ts` (new)
- Adapted from C. Resend client is now **lazy** (created inside the function, not at
  module load) so `next build` never trips on a missing `RESEND_API_KEY`.
- Sender is configurable via `RESEND_FROM_EMAIL` (was hard-coded `noreply@yourdomain.com`).

### 2. Prisma singleton — `src/server/db.ts` (new)
- `getPrisma()` lazily constructs a cached `PrismaClient` for code outside the tRPC
  context. Lazy construction is **required**: an eager `new PrismaClient()` at module
  top-level fails Next's build-time page-data collection (no DATABASE_URL yet).

### 3. Cron unlock route — `src/app/api/cron/unlock/route.ts` (new)
- Adapted from C's `/api/cron/unlock-capsules`:
  - relation `user` → `owner`; `capsule.user.email` → `capsule.owner.email`
  - `NEXT_PUBLIC_APP_URL` → `NEXT_PUBLIC_SITE_URL`
  - `db` import → `getPrisma()`
  - mounted at `/api/cron/unlock` to match `vercel.json`
  - `export const dynamic = "force-dynamic"` so it always runs fresh
- Auth unchanged: `Authorization: Bearer <CRON_SECRET>`.

### 4. Vercel cron schedule — `vercel.json` (new)
```json
{ "crons": [ { "path": "/api/cron/unlock", "schedule": "0 9 * * *" } ] }
```
Once daily at 09:00 UTC.

### 5. Capsule router `get` + `delete` — `src/server/trpc/routers/capsule.ts`
- Added, adapted to A (`ctx.prisma`, `ownerId`/`owner`, `orderIndex`, includes recipients/items).
- Ownership-checked (`NOT_FOUND` / `FORBIDDEN`).

### 6. Env documentation — `.env.example`
- Added `RESEND_FROM_EMAIL` (names only). All other vars already present in A.

## Deferred (TODO — quarantined reference kept, NOT wired)

### T1. `list` real data — design-shape conflict (HIGH value, MEDIUM effort)
A's dashboard renders `<CapsuleCard {...capsules[0]} />` expecting
`{ from, sealed, unlocks, remaining, progress, accent }`. Returning raw `Capsule`
rows breaks the frontend typecheck. **Required:** a presenter mapping `Capsule` →
card props (countdown + progress math from `unlockAt`/`createdAt`/`lockedAt`).
Reference: `_imports/from-nested-time-capsule/src/server/api/routers/capsule.ts`.

### T2. Item mutations (`addTextItem`/`addFileItem`) — crypto boundary (HIGH effort)
A's `CapsuleItem` is encryption-first: fields `kind`, `ciphertext`, `iv`, `orderIndex`,
`storagePath`, `mimeType`, `sizeBytes` — **no plaintext `content`**. C's `addTextItem`
writes `content` directly. Porting requires routing text through
`src/server/crypto/index.ts` (AES-256-GCM), which is **still a stub that throws**.
Implement crypto first, then add item mutations.

### T3. Storage approach — divergent philosophies (DECISION needed)
A: server-side `storage.getUploadUrl` signed URLs, bucket `capsule-media` (more secure).
C: client-side `uploadCapsuleFile`, public URLs, bucket `capsule-items`.
A's approach was kept. C's client lib + `FileUpload` component are quarantined.
Decide one bucket + one upload path before building the upload UI.

### T4. Capsule detail page — referenced by unlock email, missing in A
The cron email deep-links to `/capsule/<id>`, but A has no per-capsule detail route
(C's `(dashboard)/capsules/[id]` is quarantined). Add the page before production,
or the unlock email links nowhere.

### T5. Dashboard / capsule-list UI wiring
A's dashboard is currently sample-data only. Once T1 lands, replace the static hero/grid
with live data. C's `capsule-list` / `capsule-detail` components are quarantined as reference.

## Ordering recommendation
1. Implement crypto (`src/server/crypto/index.ts`) — unblocks T2.
2. Build the `Capsule` → card presenter, wire `list` (T1).
3. Add capsule detail route (T4) so unlock emails resolve.
4. Decide storage approach (T3), then file-upload UI.
5. End-to-end test the cron → email → detail flow.
