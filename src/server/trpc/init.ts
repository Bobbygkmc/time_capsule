import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

export const createTRPCContext = async (opts: { headers: Headers }) => {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Mesh: Ensure user row exists in public.User table
  if (user) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email! },
      create: { 
        id: user.id, 
        email: user.email!,
      },
    })
  }

  return {
    user,
    prisma,
    ...opts,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})
