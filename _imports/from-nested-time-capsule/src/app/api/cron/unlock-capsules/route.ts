import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendUnlockEmail } from "~/lib/email";

// Vercel Cron calls this with the CRON_SECRET in the Authorization header.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all capsules that have passed their unlock date but are still LOCKED
  const due = await db.capsule.findMany({
    where: { unlockAt: { lte: now }, status: "LOCKED" },
    include: { user: { select: { email: true } } },
  });

  const results = await Promise.allSettled(
    due.map(async (capsule) => {
      await db.capsule.update({
        where: { id: capsule.id },
        data: { status: "UNLOCKED" },
      });

      const capsuleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/capsules/${capsule.id}`;
      await sendUnlockEmail(capsule.user.email, capsule.title, capsuleUrl);

      return capsule.id;
    }),
  );

  const unlocked = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ unlocked, failed });
}
