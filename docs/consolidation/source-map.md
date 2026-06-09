# TimeCapsule Consolidation — Source Map

**Date:** 2026-05-31
**Canonical target:** A = `~/projects/timecapsule`
**Audit basis:** `~/reports/timecapsule-divergence-audit.md`

## The three copies

| ID | Path | Git | Role |
|----|------|-----|------|
| **A** | `~/projects/timecapsule` | branch `chore/repo-infra`, remote `Bobbygkmc/time_capsule.git`, last commit May 17 | **Canonical** — richest architecture, design system, planning docs |
| **B** | `~/workspace/active/timecapsule` | branch `master`, same remote, last commit Apr 25 | Workspace + `reports/`; **physically contains C** |
| **C** | `~/workspace/active/timecapsule/time-capsule` | none of its own; tracked as B's `time-capsule/` subdir | Frozen scaffold; **only working runtime** (cron/email/storage/CRUD) |

## Stack / convention differences (why porting requires adaptation)

| Aspect | A (canonical) | C (donor) |
|--------|---------------|-----------|
| Next.js | 16.2.6 (Turbopack) | ~15.2 |
| Prisma | 7.8 | 6.6 |
| Package manager | pnpm | npm |
| Path alias | `@/*` → `src/*` | `~/*` → `src/*` |
| tRPC layout | `src/server/trpc/` (`init.ts`, `ctx.prisma`) | `src/server/api/` (`ctx.db`) |
| Prisma access | `ctx.prisma` + lazy client in `init.ts` | `~/server/db` singleton |
| Capsule owner | `ownerId` (Uuid) + relation `owner` | `userId` + relation `user` |
| Item model | `CapsuleItem.kind` (`ItemKind`), **encrypted** `ciphertext`/`iv` Bytes, `orderIndex` | `CapsuleItem.type` (`CapsuleItemType`), **plaintext** `content` |
| Extra models | `CapsuleRecipient`, `AuditLog` | — |
| Crypto | `src/server/crypto/index.ts` (AES-256-GCM boundary, stubbed) | none |
| Storage | server-side tRPC signed-URL router, bucket `capsule-media` | client lib, public URL, bucket `capsule-items` |
| URL env var | `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_APP_URL` |
| Design system | bespoke (`components/design/*`) | basic `ui/button` + framer-motion |

## C runtime feature inventory (the donor set)

| Feature | C source | Status in A before | Action taken |
|---------|----------|--------------------|--------------|
| Cron unlock job | `src/app/api/cron/unlock-capsules/route.ts` | absent | **Ported** → `src/app/api/cron/unlock/route.ts` (adapted) |
| Resend email | `src/lib/email.ts` | absent | **Ported** → `src/lib/email.ts` (adapted) |
| Supabase storage | `src/lib/storage.ts` (client, public URL) | A has server signed-URL router | **Quarantined only** — A's approach kept |
| Capsule `list` | `src/server/api/routers/capsule.ts` | stub (sample data) | **TODO** — design-shape conflict, not wired |
| Capsule `get` | same | absent | **Ported** (adapted to A schema) |
| Capsule `delete` | same | absent | **Ported** (adapted to A schema) |
| Capsule `create` | same | already implemented in A (with recipients) | A's kept |
| `addTextItem` / `addFileItem` | same | absent | **TODO** — A is encryption-first, no `content` column |
| Capsule CRUD UI, nav, page-transition | `src/components/**`, `src/app/(dashboard)/**` | A has its own design system | **Quarantined only** (reference) |

## Quarantine

All of C's source (excluding `node_modules`, `.next`, and its secret-bearing `.env`)
was copied verbatim into:

```
_imports/from-nested-time-capsule/
```

This directory is **excluded from tsconfig and eslint** and is not part of A's
build. It exists purely as a porting reference. `_imports/from-nested-time-capsule/.env`
was intentionally NOT copied (secrets); see `ENV-OMITTED.txt` there.
