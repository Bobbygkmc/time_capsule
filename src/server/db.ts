import { PrismaClient } from "@prisma/client";

/**
 * Lazily-constructed PrismaClient singleton.
 *
 * Added during the 2026-05-31 consolidation so server code that runs *outside*
 * the tRPC request context (e.g. the Vercel cron unlock route) can reach the
 * database. Construction is deferred to first use via `getPrisma()` — never at
 * module load — so `next build`'s page-data collection does not instantiate a
 * client before DATABASE_URL is available. This mirrors copy A's existing tRPC
 * pattern (`src/server/trpc/init.ts`), which also news up Prisma lazily.
 *
 * The global cache prevents exhausting connections during dev hot-reload.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
