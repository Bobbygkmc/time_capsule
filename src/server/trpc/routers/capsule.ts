import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../init'

export const capsuleRouter = router({
  // TODO(consolidation 2026-05-31): wire `list` to real data.
  // Copy C has a working Prisma implementation
  //   (_imports/from-nested-time-capsule/src/server/api/routers/capsule.ts):
  //     ctx.db.capsule.findMany({ where: { userId }, include: { _count } })
  // It was intentionally NOT ported in place because the dashboard consumes the
  // *design shape* ({ from, sealed, unlocks, remaining, progress, accent }) via
  // <CapsuleCard {...capsules[0]} />. Returning raw Capsule rows breaks the
  // frontend typecheck. Porting requires a presenter that maps Capsule -> card
  // props (countdown/progress formatting). See docs/consolidation/import-plan.md.
  list: protectedProcedure.query(async ({ ctx }) => {
    // For now, return the sample data structure to match the design integration
    // Once DB is migrated, this will query Prisma
    return [
      {
        id: "1",
        title: "Letter to myself, year one sober",
        from: "for yourself · written 22 Sep 2025",
        sealed: "22 Sep 2025",
        unlocks: "22 Sep 2026",
        remaining: "4 mo, 5 d",
        progress: 0.66,
        accent: true,
      },
      // ... more items
    ];
  }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(80),
      description: z.string().optional(),
      unlockAt: z.date(),
      recipients: z.array(z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { title, description, unlockAt, recipients } = input;
      
      return ctx.prisma.$transaction(async (tx) => {
        const capsule = await tx.capsule.create({
          data: {
            title,
            description,
            unlockAt,
            ownerId: ctx.user.id,
            status: 'DRAFT',
            recipients: {
              create: recipients.map(r => ({
                name: r.name,
                email: r.email,
                accessToken: Math.random().toString(36).substring(2), // placeholder
              }))
            }
          },
        });
        
        return capsule;
      });
    }),

  // Ported from copy C (adapted to A: ownerId/owner, ctx.prisma, recipients/items).
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const capsule = await ctx.prisma.capsule.findUnique({
        where: { id: input.id },
        include: {
          items: { orderBy: { orderIndex: 'asc' } },
          recipients: true,
        },
      })

      if (!capsule) throw new TRPCError({ code: 'NOT_FOUND' })
      if (capsule.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return capsule
    }),

  // Ported from copy C (adapted to A: ownerId, ctx.prisma).
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const capsule = await ctx.prisma.capsule.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      })

      if (!capsule) throw new TRPCError({ code: 'NOT_FOUND' })
      if (capsule.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      await ctx.prisma.capsule.delete({ where: { id: input.id } })
      return { id: input.id }
    }),

  // TODO(consolidation 2026-05-31): item mutations (addTextItem / addFileItem)
  // were NOT ported. Copy A's CapsuleItem is encryption-first (fields: kind,
  // ciphertext, iv, orderIndex, storagePath, mimeType, sizeBytes) with NO
  // plaintext `content` column. C's addTextItem writes `content` directly,
  // which conflicts with A's crypto boundary (src/server/crypto/index.ts, still
  // a stub). Routing text through encryption is required before porting.
  // Reference: _imports/from-nested-time-capsule/src/server/api/routers/capsule.ts
})
