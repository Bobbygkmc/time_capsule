# Time Capsule — Build Plan

> **Phase 0 deliverable.** Written before any implementation. This is the strategic roadmap.
> Each implementation phase (1–9) gets a more granular task plan written at the start of that phase, not here.

**Goal:** Ship a production-grade Next.js 14 app that lets users create encrypted digital time capsules (text, images, video, audio, files) locked until a chosen unlock date and optionally delivered by email to specified recipients.

**Architecture:** Next.js 14 App Router on Vercel, tRPC v11 for typed RPC, Prisma against Supabase Postgres, Supabase Auth (SSR cookies) for sessions, Supabase Storage (private bucket) for media via signed-URL uploads, Resend for transactional email, Vercel Cron for the hourly unlock job. Encryption layer enforces the unlock gate server-side; clients never see ciphertext or DEKs directly.

**Tech stack (locked):** Next.js 14 · TypeScript strict · Tailwind · shadcn/ui · tRPC v11 · Prisma · Supabase (Postgres + Auth + Storage) · Resend · Vercel + Vercel Cron · Zod throughout.

**Owner:** Chuk Uyammadu — solo dev, operating from iPhone via Termius. All command blocks targeting Chuk must be single pasteable blocks with `CHUKEOF` heredoc delimiter when needed. Prefer `sed` over `nano`. No multi-step nano walkthroughs.

---

## Environment snapshot

| Tool | Version |
|---|---|
| Node | v22.22.3 |
| npm | 10.9.8 |
| pnpm | 10.33.2 (installed) |
| yarn | not installed |
| OS | Linux 6.18.29+rpt-rpi-2712 (Raspberry Pi host) |
| Repo state | `.git/`, `.gitignore`, `README.md`, `.claude/` — nothing else |

---

## Phase tracker

| # | Phase | Status | Acceptance gate |
|---|---|---|---|
| 0 | Plan | **drafted, awaiting Chuk** | Chuk reviews this doc |
| 1 | Scaffold | not started | `dev`/`build`/`lint` clean, empty homepage renders |
| 2 | Database + schema | not started | Studio opens all tables, seed runs, cron query uses index |
| 3 | Auth | not started | Full sign-up → verify → sign-in → protected route → sign-out |
| 4 | Capsule CRUD + uploads | not started | Create/lock capsule, attach items, RLS enforced |
| 5 | Encryption (**Chuk picks A vs B**) | not started | Round-trip + tamper-detection tests pass |
| 6 | Unlock cron + email | not started | Manual cron trigger flips status, emails send, idempotent |
| 7 | Frontend pages | not started | Full happy path on desktop + mobile, Lighthouse mobile ≥ 80 |
| 8 | Polish + deploy | not started | Preview deploy passes smoke test, Lighthouse desktop ≥ 90 |
| 9 | Documentation | not started | All `docs/*.md` finalized |

---

## Phase 0 — Plan (this document)

**Sub-tasks**
- [x] Read `README.md`, `.gitignore`
- [x] Confirm Node 22+ and `npm` work; note pnpm availability
- [x] Inventory existing files
- [x] Write phase breakdown, risk register, decisions log, open questions, effort estimates
- [ ] **GATE: Chuk reviews and approves before Phase 1 starts**

**Estimated effort:** 1–2 h (this doc).

---

## Phase 1 — Scaffold

**Goal:** Working Next.js 14 + Tailwind + shadcn project with the agreed folder layout, lint/build clean.

**Sub-tasks**
1. **Confirm package manager** with Chuk (pnpm installed; default to `npm` per prompt if he doesn't object). All commands below assume `npm`; swap if pnpm wins.
2. `npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" --use-npm` — confirm conflict handling with existing `.git`/`.gitignore`/`README.md` (`create-next-app` will warn — keep README, allow it to scaffold).
3. Install runtime deps in one command:
   `npm i @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query @prisma/client @supabase/supabase-js @supabase/ssr resend zod superjson date-fns`
4. Install dev deps:
   `npm i -D prisma @types/node typescript prettier eslint-config-prettier`
5. `npx shadcn@latest init` — defaults: style=default, base=neutral, CSS variables=yes.
6. Add shadcn components (single command):
   `npx shadcn@latest add button card form input textarea calendar dialog dropdown-menu toast separator label tabs alert badge skeleton`
7. Create folder layout under `src/`:
   - `app/` (already created)
   - `components/ui/` (shadcn target)
   - `components/feature/`
   - `lib/` — `lib/supabase/{server,client,middleware}.ts`, `lib/prisma.ts`, `lib/utils.ts`
   - `server/trpc/` — `init.ts`, `root.ts`, `routers/`
   - `server/db/` — wraps Prisma client + transactions
   - `server/auth/` — helpers around Supabase auth (current user, require auth)
   - `server/storage/` — signed-URL issuance, path conventions
   - `server/email/` — Resend client + templates
   - `server/crypto/` — encryption primitives (Phase 5 hookpoint, stub now)
   - `types/` — shared types
8. Prettier config (`.prettierrc.json`): semicolons, single quotes, 100 col, trailing commas all.
9. ESLint: extend `next/core-web-vitals`, plus `@typescript-eslint/no-explicit-any: error`.
10. Empty `vercel.json` placeholder (`{}`) — finalized Phase 8.
11. Write `.env.example` listing every variable that will be referenced by Phases 2–8 (DB urls, Supabase keys, Resend key, CRON_SECRET, encryption keys, app URL, sender domain placeholder).
12. Update `README.md` setup section so the commands listed actually work — verify by clean clone in a tmp dir.

**Acceptance gate**
- `npm run dev` boots without warnings, homepage renders.
- `npm run build` succeeds.
- `npm run lint` clean.
- `git status` shows only intended files.

**Risks**
- `create-next-app` in a non-empty dir asks confirmation; need to pass through cleanly.
- shadcn init can collide with the default tailwind config — verify `tailwind.config.ts` after.
- Pi host has slower `npm install` — be patient, no timeouts.

**Commit:** `phase 1: scaffold next + tailwind + shadcn + folder layout`

**Estimated effort:** 1–2 h.

---

## Phase 2 — Database + schema

**Goal:** Prisma schema, migrations, seed; ERD doc; verified index usage on the cron query.

**Sub-tasks**
1. Create Supabase project (or use existing) — confirm with Chuk which org/project. Record project ref in `.env.example` as a comment.
2. Configure `prisma/schema.prisma` with `datasource db { url = env("DATABASE_URL"), directUrl = env("DIRECT_URL") }`. Use pooled URL for runtime, direct URL for migrations.
3. Model definitions:
   - `User { id String @id @db.Uuid; email String @unique; name String?; createdAt DateTime @default(now()) }` — id matches `auth.users.id`.
   - `Capsule { id; ownerId @db.Uuid; title; description?; unlockAt; status CapsuleStatus; encryptionKeyId String?; createdAt; updatedAt; lockedAt? }`. `status: DRAFT | LOCKED | UNLOCKED`.
   - `CapsuleItem { id; capsuleId; kind ItemKind; storagePath?; mimeType?; sizeBytes?; ciphertext Bytes?; encryptedDek Bytes?; iv Bytes?; orderIndex Int }`. `kind: TEXT | IMAGE | VIDEO | AUDIO | FILE`.
   - `CapsuleRecipient { id; capsuleId; email; name?; notifiedAt?; viewedAt?; accessToken String @unique }`.
   - `AuditLog { id; actorId?; action; targetType; targetId; metadata Json; createdAt }`.
4. Indexes:
   - `@@index([status, unlockAt])` on Capsule (covers cron query)
   - `@@index([ownerId])` on Capsule
   - `@@index([capsuleId, orderIndex])` on CapsuleItem
   - `@@index([accessToken])` on CapsuleRecipient (unique already creates one but make intent explicit)
5. **ID strategy decision** (see Decisions Log): cuid2 default. Use `@id @default(dbgenerated("..."))` or app-side cuid2 from `@paralleldrive/cuid2`. Decide before migration.
6. `npx prisma migrate dev --name init` against the dev branch.
7. Apply Supabase-side: enable `pgcrypto` if needed for randomness, configure RLS — but RLS policies for Postgres-side enforcement come in Phase 4 (we use service role from the server initially; RLS is belt-and-suspenders against direct client queries).
8. Write `prisma/seed.ts`:
   - Two test users matching real Supabase auth users (created via admin API helper or document manual creation).
   - One sample capsule in `DRAFT` with two items (one TEXT, one IMAGE placeholder path).
9. Verify cron query plan: `EXPLAIN SELECT id FROM "Capsule" WHERE status = 'LOCKED' AND "unlockAt" <= now() LIMIT 50;` — must show index scan on `(status, unlockAt)`.
10. Write `docs/DATA_MODEL.md`:
    - Mermaid ERD.
    - Per-field rationale (why nullable, why bytes, why this enum).
    - Query patterns the schema is optimized for (cron, dashboard list, recipient lookup by token).

**Acceptance gate**
- `npx prisma studio` opens, all tables visible.
- `npm run db:seed` (script alias) completes without error.
- `EXPLAIN` on the cron query shows an index scan.

**Risks**
- Mixing pooled vs direct URL — Prisma migrations need direct. Document loudly.
- Supabase free-tier pause: if the project is inactive it pauses. Note in `.env.example`.
- `auth.users` ↔ `public.User` FK approach: we'll use `User.id = auth.users.id` (matched UUIDs), populated by the Phase 3 trigger/upsert.

**Commit:** `phase 2: prisma schema + migration + seed + data model docs`

**Estimated effort:** 3–4 h.

---

## Phase 3 — Auth

**Goal:** Supabase Auth via SSR cookies, full sign-up/sign-in/recovery flow, middleware protecting `/app/*`, mirrored `public.User` row on first auth.

**Sub-tasks**
1. Create Supabase clients:
   - `lib/supabase/server.ts` — `createServerClient` with cookie store.
   - `lib/supabase/client.ts` — browser `createBrowserClient`.
   - `lib/supabase/middleware.ts` — session refresh helper used by `middleware.ts`.
2. Root `middleware.ts` — refresh session, redirect unauthenticated requests to `/sign-in?next=...` when path starts with `/app`.
3. Pages (App Router):
   - `app/(auth)/sign-in/page.tsx`
   - `app/(auth)/sign-up/page.tsx`
   - `app/(auth)/forgot-password/page.tsx`
   - `app/(auth)/reset-password/page.tsx`
   - `app/(auth)/verify-email/page.tsx`
   - `app/(auth)/callback/route.ts` — OAuth/magic-link callback handler.
4. Forms use shadcn `form` + Zod resolver. Both email/password and magic link.
5. Sign-out server action (`app/(auth)/sign-out/route.ts`).
6. **User-row mirroring** — see Decisions Log; current lean is **app-level upsert** on first authenticated request via a middleware-side helper, because it keeps schema mutations out of Supabase migrations and is debuggable from app logs. Document tradeoffs in `docs/ARCHITECTURE.md`.
7. Auth helpers in `server/auth/`:
   - `getCurrentUser()` — reads session from cookies, returns `User | null`.
   - `requireUser()` — throws `UNAUTHORIZED` for tRPC; used by `protectedProcedure`.
8. Rate limit sign-in attempts — in-memory token bucket per IP+email, documented as v1 limitation (replaced in Phase 8 with Upstash if budget allows).

**Acceptance gate**
- E2E (manual): sign up → email verify → sign in → land on `/app/dashboard` → sign out.
- Hitting `/app/dashboard` while signed out redirects to `/sign-in?next=/app/dashboard`.
- After sign-in, `public.User` row exists with id matching `auth.users.id`.
- Tests: middleware unit test (mocked request), `requireUser` test for the no-session case.

**Risks**
- `@supabase/ssr` cookie handling in App Router has sharp edges around server actions vs route handlers. Reference current Supabase docs at implementation time.
- Magic link redirect URL must be added to Supabase Auth allowlist — document in `RUNBOOK.md`.

**Commit:** `phase 3: supabase auth + ssr + protected routes`

**Estimated effort:** 3–5 h.

---

## Phase 4 — Capsule CRUD + media uploads

**Goal:** tRPC v11 router, full capsule lifecycle (draft → lock), signed-URL uploads to Supabase Storage, RLS configured.

**Sub-tasks**
1. tRPC bootstrap:
   - `server/trpc/init.ts` — `initTRPC.context<Context>().create({ transformer: superjson })`.
   - Context builder reads Supabase session, attaches `user` (or null) and `prisma`.
   - `publicProcedure` / `protectedProcedure` (the latter throws `UNAUTHORIZED` if no user).
   - `server/trpc/root.ts` — `appRouter` combining feature routers.
   - tRPC fetch handler at `app/api/trpc/[trpc]/route.ts`.
   - Client provider in `app/providers.tsx` wrapping `<QueryClientProvider>` and `<trpc.Provider>`.
2. Procedures (Zod schemas live next to each):
   - `capsule.create` — `{ title, description? }` → returns draft capsule
   - `capsule.list` — returns user's capsules grouped by status
   - `capsule.get` — `{ id }` → capsule + items metadata + recipients (no plaintext until Phase 5)
   - `capsule.update` — draft-only; rejects if status != DRAFT
   - `capsule.delete` — draft-only
   - `capsule.addItem` — `{ capsuleId, kind, storagePath?, text?, mimeType?, sizeBytes? }`
   - `capsule.removeItem` — `{ itemId }` — draft-only
   - `capsule.reorderItems` — `{ capsuleId, orderedItemIds: string[] }`
   - `capsule.lock` — `{ id, unlockAt, recipients: [{email, name?}] }` → validates unlockAt in future, generates encryption (Phase 5 hook), flips status to LOCKED
   - `storage.getUploadUrl` — `{ capsuleId, filename, mimeType, sizeBytes }` → signed PUT URL + storage path
3. Supabase Storage:
   - Create private bucket `capsule-media` (idempotent setup in `scripts/supabase-setup.ts` or documented manual step in `RUNBOOK.md`).
   - Path convention: `capsules/{capsuleId}/{itemId}/{filename}`.
   - File size cap enforced server-side before signing: configurable, default 100 MB per item.
   - RLS on storage: only owner can write to their capsule path; no public reads (server-mediated download in Phase 5).
4. React Query hooks via tRPC: `trpc.capsule.list.useQuery()`, etc. Wire into UI in Phase 7.
5. Audit log writes on create, lock, delete, recipient add.

**Acceptance gate**
- Create a draft, attach an image (signed-URL flow) and a text item, set 2 recipients, lock.
- Attempting `update` on a LOCKED capsule returns `BAD_REQUEST`.
- Reading items from a LOCKED capsule returns metadata but no plaintext (placeholder until Phase 5).
- Storage RLS denies cross-user writes (manual test with two seeded users' tokens).
- tRPC procedure tests for auth gating + draft-only invariants.

**Risks**
- Storage RLS is the #1 misconfig vector. Test it explicitly with a wrong user's session.
- Vercel function body limit (4.5 MB) — signed-URL upload sidesteps this; do not add server-side proxy uploads.
- tRPC v11 API differs from v10 in subtle places; pin version and consult v11 docs.

**Commit:** `phase 4: capsule crud + signed-url uploads + rls`

**Estimated effort:** 6–8 h.

---

## Phase 5 — Encryption (**Chuk picks A vs B first**)

**HARD GATE:** Do not start Phase 5 implementation until Chuk picks Option A or B. Both options are sketched in detail in `docs/SECURITY.md` (which is also produced in this phase).

### Option A — Server-side AES-256-GCM (default if Chuk doesn't pick)

- Per-capsule 256-bit DEK generated at lock time via `crypto.randomBytes(32)`.
- DEK wrapped (encrypted) by a Key Encryption Key (KEK). KEK source:
  - v1: env-injected master key `MASTER_KEK` (256-bit, base64).
  - v1.5: migrate to Supabase Vault when stable.
- Per-item encryption: AES-256-GCM, unique 96-bit IV per item via `crypto.randomBytes(12)`. Authenticated additional data (AAD) = `${capsuleId}:${itemId}`.
- Storage: `CapsuleItem.ciphertext` holds AEAD output (ciphertext || tag) for text items; for binary items, ciphertext is uploaded to storage and the DB row holds `encryptedDek`, `iv`, `storagePath`.
- Read path enforces gate: `status == UNLOCKED && unlockAt <= now()` checked **server-side, in the same transaction as the decrypt call**. Tests cover the "forced status flip without time match" case.
- Key lifecycle and rotation documented in `SECURITY.md`.

### Option B — Client-side E2E

- DEK derived from user passphrase via Argon2id (memory ≥ 64 MB, iterations tuned to ~500 ms on target hardware).
- Server stores ciphertext, salt, parameters — never the passphrase or DEK.
- Recipients access via passphrase shared out-of-band (significant UX cost).
- No server-side previews, search, or thumbnails possible.
- Recovery = catastrophic: lose passphrase, lose capsule.

### Sub-tasks (assuming Option A — adjust if B chosen)
1. `server/crypto/keys.ts` — generateDek, wrapDek(dek, kek), unwrapDek(wrapped, kek).
2. `server/crypto/aead.ts` — encrypt(plaintext, dek, aad) → {ciphertext, iv}; decrypt({ciphertext, iv}, dek, aad) → plaintext.
3. Wire into `capsule.lock` (generate DEK, wrap with KEK, store) and item encryption (encrypt at write time when item is added to a locked capsule path — but since we lock after items are added in current flow, **encrypt-on-lock** is the right model; revisit if UX changes).
4. Read path in `capsule.get` and recipient route: decrypt items only when gate passes.
5. Tests:
   - Round-trip: encrypt → decrypt returns original plaintext for each item kind.
   - Tamper: flip a ciphertext byte → decrypt throws.
   - Wrong AAD: same ciphertext + different capsuleId → decrypt throws.
   - Gate: locked capsule with `unlockAt` in past but status still `LOCKED` (force a fixture flip) → decrypt path refused. Locked capsule with `status=UNLOCKED` but `unlockAt` in future → decrypt path refused.
6. `docs/SECURITY.md`:
   - Algorithms + parameters (AES-256-GCM, IV size, KDF if any).
   - Key lifecycle: generation, wrapping, storage, rotation, destruction.
   - Threat model: attacker with DB only / DB + Storage / + KEK / + service role.
   - RLS policies in full.
   - Incident response: what to do if `SUPABASE_SERVICE_ROLE_KEY` or `MASTER_KEK` leaks.

**Acceptance gate**
- All four test cases above pass.
- Locked capsule, status forcibly flipped in fixture, decrypt still refused because of timestamp gate.

**Risks**
- Master key in env = single point of failure. Documented; planned migration to Vault.
- IV reuse = catastrophic for GCM. Use `crypto.randomBytes(12)` per item, never derived.
- Forgetting to set AAD = silent loss of binding between ciphertext and capsule/item.

**Commit:** `phase 5: encryption + key management`

**Estimated effort:** 4–6 h (Option A) / 8–10 h (Option B, +UX overhead).

---

## Phase 6 — Unlock scheduler + email

**Goal:** Hourly Vercel cron flips eligible capsules to UNLOCKED, sends Resend emails to owner + recipients, idempotent, audited.

**Sub-tasks**
1. `app/api/cron/unlock/route.ts`:
   - Verifies `Authorization: Bearer ${process.env.CRON_SECRET}` (constant-time compare). 401 otherwise.
   - Query: `SELECT id FROM Capsule WHERE status = 'LOCKED' AND unlockAt <= now() ORDER BY unlockAt ASC LIMIT 50`.
   - For each id, run in transaction: flip status to UNLOCKED, set `unlockedAt` (add field if absent — confirm in Phase 2 wrap-up).
   - Enqueue Resend emails: one to owner, one per recipient. Email send is **outside** the transaction; on send success, set `notifiedAt` per recipient.
   - Idempotency: only email recipients where `notifiedAt IS NULL`. Re-runs are safe.
   - Returns JSON: `{ processed: N, partial: bool }`. `partial: true` if we hit the 50-cap.
2. `vercel.json` cron entry: `{ "crons": [{ "path": "/api/cron/unlock", "schedule": "0 * * * *" }] }`.
3. Resend setup:
   - `server/email/client.ts` — Resend client.
   - Templates as React components (Resend supports React Email). Two templates:
     - `templates/CapsuleUnlocked.tsx` — owner notification with link to `/app/capsule/[id]`.
     - `templates/RecipientInvite.tsx` — recipient link to `/c/[id]?token=...`.
   - **Sender domain — open question for Chuk.** Default to verified sandbox domain (`onboarding@resend.dev`) for dev; need a real verified domain for prod.
4. Recipient access route:
   - `app/c/[id]/page.tsx` — reads `token` query param, looks up `CapsuleRecipient` by token, verifies token not expired (30-day window from `notifiedAt`), verifies capsule is UNLOCKED, decrypts and renders.
   - Single-use semantics: set `viewedAt` on first view; subsequent views still allowed within window but flagged in audit.
   - Token = 256-bit URL-safe random string.
5. Audit log entries on: cron run start/end, per-capsule unlock, per-email send, recipient view.

**Acceptance gate**
- Manually trigger endpoint with a seeded capsule whose `unlockAt` is in the past + auth header → status flips, audit rows written, Resend dashboard shows emails.
- Re-trigger immediately → no duplicate emails (notifiedAt prevents).
- Hit endpoint without auth header → 401.
- Hit endpoint with wrong CRON_SECRET → 401.
- Seed 51 ready-to-unlock capsules → first run processes 50, returns `partial: true`; second run processes the last one.
- Tests: idempotency, date-gate, batch boundary, auth.

**Risks**
- Vercel cron can drift or skip; idempotency + repeated runs cover this.
- Resend rate limits — 50/run × 1/hr = well under defaults, but document.
- Email delivery failure mid-batch should not block other recipients. Per-recipient try/catch with audit on failure.

**Commit:** `phase 6: unlock cron + resend notifications`

**Estimated effort:** 3–4 h.

---

## Phase 7 — Frontend pages

**Goal:** Full UI — marketing landing, dashboard, capsule wizard, capsule detail, recipient view, account. Mobile-first, accessible, working happy path end-to-end.

**Sub-tasks**
1. Global layout: header (logo + nav), footer, theme tokens. Confirm with Chuk whether to match his portfolio palette (Deep Forest + Golden Bill, JetBrains Mono + Fraunces) or differentiate.
2. `/` (marketing) — hero, three-step explainer, FAQ, footer. Restrained terminal/homelab-adjacent aesthetic.
3. `/app/dashboard` — three columns/tabs: Draft / Locked / Unlocked. Locked cards show live countdown.
4. `/app/capsule/new` — wizard:
   - Step 1: title + description
   - Step 2: unlock date (shadcn calendar) + time
   - Step 3: recipients (add/remove, email validation)
   - Step 4: items — text editor for TEXT, drag-drop uploader with progress for media (uses signed-URL flow from Phase 4)
   - Step 5: review + confirm lock (modal with explicit "I understand this is irreversible")
5. `/app/capsule/[id]` — locked: countdown + recipient list; unlocked: full item rendering with appropriate viewers (text, image gallery, audio/video players, file download).
6. `/c/[id]?token=...` — recipient view (server component, decrypts after gate).
7. `/account` — profile (email, name edit), sign-out button.
8. Loading skeletons via shadcn `skeleton`. Error boundaries per route segment. Empty states.
9. Toast notifications on every mutation success/failure.
10. Mobile testing in Chrome DevTools iPhone 14 / 15 viewport + real iPhone if Chuk can hit the preview URL.

**Acceptance gate**
- End-to-end happy path on desktop + mobile, no console errors.
- Lighthouse mobile ≥ 80 on `/` and `/app/dashboard`.
- All forms keyboard-navigable; focus rings visible; date picker accessible.

**Risks**
- This is the largest phase by far. Time-box; don't gold-plate.
- shadcn calendar accessibility — verify with axe.
- Media playback on iOS Safari has quirks; test on a real device.

**Commit:** `phase 7: full frontend ui`

**Estimated effort:** 8–12 h.

---

## Phase 8 — Polish + deploy

**Goal:** Production-ready: error tracking, SEO, a11y, rate limits, prod config, Vercel preview deploy passes smoke test.

**Sub-tasks**
1. Sentry (confirm with Chuk; if skipped, document why). Wire `@sentry/nextjs`.
2. SEO: Next 14 metadata API on all pages, `app/robots.ts`, `app/sitemap.ts`, dynamic OG image generation for landing via `app/opengraph-image.tsx`.
3. Accessibility pass with `axe` browser ext on all routes. Fix violations.
4. Rate limiting on `auth` callback, `capsule.create`, `storage.getUploadUrl`. Upstash if Chuk wants the dependency; in-memory with documented limitation otherwise.
5. `next.config.js` — image remote pattern for Supabase Storage URLs, `experimental.serverActions` if used.
6. `next/font` for chosen typefaces.
7. Finalize `vercel.json`: crons, security headers (CSP, HSTS, frame-ancestors none, etc.).
8. `.env.example` final pass — every variable from every phase, with comments on source/format.
9. `npm run build && npm run start` locally with `.env.production.local` — smoke test.
10. `vercel deploy --prebuilt` to preview URL — manual smoke test of full happy path on preview.

**Acceptance gate**
- Preview deploy URL serves a working sign-up + create-capsule + lock flow.
- Lighthouse desktop ≥ 90 on perf/a11y/best-practices/SEO for `/` and `/app/dashboard`.
- Headers verified via `curl -I` (CSP present, HSTS present).

**Risks**
- Vercel free tier function timeout (10s) — the cron must finish in 10s with 50 capsules + Resend calls. Measure; if tight, drop batch size.
- CSP can break shadcn dialogs/popovers if too strict; tune carefully.

**Commit:** `phase 8: polish + deploy config`

**Estimated effort:** 3–4 h.

---

## Phase 9 — Documentation

**Goal:** Every doc in `docs/` finalized and consistent with the implemented system.

**Sub-tasks**
1. `PLAN.md` — mark each phase complete with date stamps.
2. `ARCHITECTURE.md` — system overview, Mermaid diagrams for auth/upload/unlock flows, trust boundaries, third-party dependency table with failure-mode notes.
3. `DATA_MODEL.md` — refine with final schema, indexes, query patterns.
4. `SECURITY.md` — STRIDE threat model, encryption design, key lifecycle, RLS policies in full, incident response (incl. leaked service role / KEK procedures).
5. `RUNBOOK.md` — rotate `CRON_SECRET`, replay failed cron, manually unlock stuck capsule with audit trail, restore recipient token, recover from Supabase outage.
6. `API.md` — tRPC procedure reference (auth requirements, rate limits, input/output shapes).
7. `CONTRIBUTING.md` — local setup, commit format, code conventions.

**Commit:** `phase 9: documentation`

**Estimated effort:** 2–3 h.

---

## Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Encryption key management mistake (IV reuse, KEK leak, wrong AAD) | Medium | **Catastrophic** | Test round-trip + tamper + AAD + gate. KEK in env v1, Vault v1.5. Document incident response. |
| R2 | Supabase Storage RLS misconfig allows cross-user reads | Medium | High | Explicit cross-user test before merging Phase 4. Document policies in `SECURITY.md`. |
| R3 | Cron drift / Vercel skips a run | Medium | Low (idempotent) | Idempotency by `notifiedAt`. Repeated runs are safe. |
| R4 | Vercel free-tier 10s function timeout on cron with full batch | Medium | Medium | Measure on real data. Drop batch size to 25 if needed. |
| R5 | Vercel free-tier build size limit (250 MB unzipped) | Low | Medium | Avoid bundling Sharp et al. server-side; lean dependencies. |
| R6 | Supabase free-tier project auto-pauses after inactivity | High | Low | Documented in `RUNBOOK.md`. Resume manually. |
| R7 | Resend deliverability without verified domain | Medium | Medium | Block prod launch on verified sender. |
| R8 | Auth cookie SSR edge cases in App Router | Medium | High | Reference current Supabase docs at implementation time; integration test the full flow. |
| R9 | Vercel function body size (4.5 MB) blocks large media uploads | Certain | Avoided | Signed-URL direct-to-Storage pattern. |
| R10 | Forgot to delete a placeholder/in-progress feature flag in prod | Low | Medium | Phase 8 final review of `.env.example` and feature flags. |
| R11 | Recipient token leaked via email forwarding | Medium | High (single capsule) | 30-day expiry. Audit views. Consider rotation in Phase 9. |
| R12 | Race between `capsule.lock` and `capsule.update` | Low | Medium | Transactional status check in `update`/`delete` procedures. |
| R13 | Master KEK rotation = re-encrypt everything | Low (rotation) | Medium | Document rotation procedure; defer actual rotation until needed. |
| R14 | Solo developer + iPhone/Termius workflow = limited debugging surface | High | Medium | Lean on logs, audit trail. Heavy tests where they earn it. Avoid clever code. |

---

## Decisions log

### Already locked in by the brief
- **Stack**: Next 14 / TS strict / Tailwind / shadcn / tRPC v11 / Prisma / Supabase / Resend / Vercel + Cron. Not revisiting.
- **Upload pattern**: signed-URL direct to Supabase Storage (avoids Vercel body-size limit). Not revisiting.
- **Cron schedule**: hourly. Not revisiting in v1.

### Locked by this plan (will revisit only if a hard reason emerges)
- **D1 — Package manager: npm.** pnpm is installed but the brief defaulted to npm; sticking with it unless Chuk says otherwise.
- **D2 — ID format: cuid2.** Rationale: shorter than uuidv7, sort-friendly within a session, no extra Postgres extension needed. ulid is fine but cuid2 has a more active TS ecosystem. Used via `@paralleldrive/cuid2`, generated app-side. Capsule and item IDs go into URLs (`/c/[id]`) so non-sequential matters.
- **D3 — User-row mirroring strategy: app-level upsert** in middleware/auth helper rather than DB trigger. Easier to debug from Vercel logs, no Supabase migration coupling.
- **D4 — Recipient link slug: full capsule id + token query param** (`/c/{capsuleId}?token=...`). Simpler than a separate short slug; capsuleId is already non-guessable (cuid2).
- **D5 — Encryption gate enforced server-side in the same transaction as decrypt**, not in the API layer above. Belt-and-suspenders against forced status flips.
- **D6 — IV strategy: random 96-bit per item via `crypto.randomBytes(12)`.** Never derived. Stored alongside ciphertext.
- **D7 — AAD: `${capsuleId}:${itemId}`.** Binds ciphertext to its row; prevents row-swap attacks.

### Needs Chuk confirmation **before Phase 5**
- **Q1 — Encryption Option A vs B.** Default to A if no answer. A is the assumed path in this plan.

### Needs Chuk confirmation in **earlier phases** (lighter blockers)
- **Q2 — Package manager**: npm (default) or pnpm? **Decide before Phase 1.**
- **Q3 — Supabase project**: new project or existing? Org name? **Decide before Phase 2.**
- **Q4 — Landing aesthetic**: match Chuk's portfolio (Deep Forest + Golden Bill, JetBrains Mono + Fraunces) or differentiate? **Decide before Phase 7.**
- **Q5 — Resend sender domain**: which verified domain for prod emails? **Decide before Phase 6.**
- **Q6 — Sentry**: include for v1, or skip with documented reason? **Decide before Phase 8.**
- **Q7 — Rate limiter**: Upstash (paid hop) or in-memory (free, single-instance limitation)? **Decide before Phase 8.**

### Open questions (lower priority, can be deferred)
- Should we offer "reveal early" for owners (overrides the gate)? **Default: no.** Adds attack surface, undermines the product promise.
- Should locked capsules be editable in a "metadata-only" mode (title/description)? **Default: no.** Locked means locked.
- Capsule deletion after lock: allowed? **Default: yes for owner with explicit confirmation, audit log entry; recipient links die when capsule is deleted.**
- Recipient token rotation procedure if leaked. **Defer to Phase 9 RUNBOOK.**

---

## Effort summary

| Phase | Estimate (focused hours) |
|---|---|
| 0 Plan | 1–2 |
| 1 Scaffold | 1–2 |
| 2 DB + schema | 3–4 |
| 3 Auth | 3–5 |
| 4 CRUD + uploads | 6–8 |
| 5 Encryption | 4–6 (Option A) / 8–10 (Option B) |
| 6 Cron + email | 3–4 |
| 7 Frontend | 8–12 |
| 8 Polish + deploy | 3–4 |
| 9 Docs | 2–3 |
| **Total (Option A)** | **34–50 h** |
| **Total (Option B)** | **38–54 h** |

These are focused-coding hours. Calendar time depends on Chuk's availability and iPhone/Termius pacing — likely 2–4× the focused-hour estimate end-to-end.

---

## Cross-cutting standards (apply every phase)

- **Commits**: one logical change per commit. Conventional format. Phase commits use the literal `phase N: ...` form from the brief.
- **Tests**: live next to the code (`*.test.ts` colocated or in `__tests__/`). Use Vitest (decide in Phase 1; lean Vitest over Jest for Next 14 ergonomics — confirm if Chuk has a preference).
  - Required: encryption round-trip + tamper + gate; unlock cron idempotency + date-gate + batch boundary; auth middleware; tRPC `protectedProcedure` rejection.
  - Skip: exhaustive UI unit tests, snapshot tests of trivial markup.
- **Types**: TS strict on. `any` requires a justified comment immediately above. Zod schemas for every tRPC input.
- **Secrets**: never logged. Audit logs reference IDs only — never plaintext capsule content.
- **Deps**: every new package noted in its commit message and (if non-obvious) in `ARCHITECTURE.md`.
- **Branching**: work on `main` for now (solo dev). PR-based flow if/when a second contributor joins.
- **Documentation**: written as we go, not deferred.

---

## Sign-off

Phase 0 ends here. Phase 1 does not start until Chuk reviews this document and either:

1. ✅ Approves as-is, **and** answers Q2 (package manager). Q1 can wait until before Phase 5. Q3 before Phase 2. Q4–Q7 before their respective phases.
2. 🔄 Returns edits — I revise this file and re-request review.

Pending Chuk's review.
