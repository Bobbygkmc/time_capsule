import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const capsuleRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.capsule.findMany({
      where: { userId: ctx.user.id },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const capsule = await ctx.db.capsule.findUnique({
        where: { id: input.id },
        include: { items: { orderBy: { createdAt: "asc" } } },
      });

      if (!capsule) throw new TRPCError({ code: "NOT_FOUND" });
      if (capsule.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      return capsule;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(120),
        unlockAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.unlockAt <= new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unlock date must be in the future.",
        });
      }

      // Upsert the user row so Prisma FK is satisfied
      await ctx.db.user.upsert({
        where: { id: ctx.user.id },
        update: {},
        create: { id: ctx.user.id, email: ctx.user.email! },
      });

      return ctx.db.capsule.create({
        data: {
          userId: ctx.user.id,
          title: input.title,
          unlockAt: input.unlockAt,
        },
      });
    }),

  addTextItem: protectedProcedure
    .input(z.object({ capsuleId: z.string(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const capsule = await ctx.db.capsule.findUnique({
        where: { id: input.capsuleId },
        select: { userId: true, status: true },
      });

      if (!capsule) throw new TRPCError({ code: "NOT_FOUND" });
      if (capsule.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (capsule.status === "UNLOCKED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Capsule is already unlocked." });
      }

      return ctx.db.capsuleItem.create({
        data: { capsuleId: input.capsuleId, type: "TEXT", content: input.content },
      });
    }),

  addFileItem: protectedProcedure
    .input(
      z.object({
        capsuleId: z.string(),
        storagePath: z.string().min(1),
        type: z.enum(["IMAGE", "VIDEO", "FILE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const capsule = await ctx.db.capsule.findUnique({
        where: { id: input.capsuleId },
        select: { userId: true, status: true },
      });

      if (!capsule) throw new TRPCError({ code: "NOT_FOUND" });
      if (capsule.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (capsule.status === "UNLOCKED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Capsule is already unlocked." });
      }

      return ctx.db.capsuleItem.create({
        data: {
          capsuleId: input.capsuleId,
          type: input.type,
          storagePath: input.storagePath,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const capsule = await ctx.db.capsule.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!capsule) throw new TRPCError({ code: "NOT_FOUND" });
      if (capsule.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      await ctx.db.capsule.delete({ where: { id: input.id } });
    }),
});
