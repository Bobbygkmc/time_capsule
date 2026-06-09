import { type NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/server/db";
import { sendUnlockEmail } from "@/lib/email";

// Cron handler: must run fresh on every invocation, never statically cached.
export const dynamic = "force-dynamic";

/**
 * Scheduled capsule-unlock job.
 *
 * Ported from copy C's `/api/cron/unlock-capsules` during the 2026-05-31
 * consolidation and adapted to copy A's richer Prisma schema:
 *   - relation is `owner` (not C's `user`)
 *   - capsule URL uses NEXT_PUBLIC_SITE_URL (A's var) not C's NEXT_PUBLIC_APP_URL
 *   - mounted at /api/cron/unlock to match vercel.json
 *
 * Vercel Cron invokes this with `Authorization: Bearer <CRON_SECRET>`.
 * Reference original: _imports/from-nested-time-capsule/src/app/api/cron/unlock-capsules/route.ts
 *
 * NOTE: the email deep-link points at /capsule/<id>. A per-capsule detail page
 * does not yet exist in copy A (C's version is quarantined under _imports). The
 * email still sends; wire the detail route before production. See
 * docs/consolidation/import-plan.md.
 */

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const prisma = getPrisma();

  // Capsules whose unlock date has passed but are still LOCKED.
  const due = await prisma.capsule.findMany({
    where: { unlockAt: { lte: now }, status: "LOCKED" },
    include: { owner: { select: { email: true } } },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const results = await Promise.allSettled(
    due.map(async (capsule) => {
      await prisma.capsule.update({
        where: { id: capsule.id },
        data: { status: "UNLOCKED" },
      });

      const capsuleUrl = `${siteUrl}/capsule/${capsule.id}`;
      await sendUnlockEmail(capsule.owner.email, capsule.title, capsuleUrl);

      return capsule.id;
    }),
  );

  const unlocked = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ unlocked, failed });
}
