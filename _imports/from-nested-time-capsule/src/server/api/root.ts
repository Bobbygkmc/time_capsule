import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { capsuleRouter } from "~/server/api/routers/capsule";

export const appRouter = createTRPCRouter({
  capsule: capsuleRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
