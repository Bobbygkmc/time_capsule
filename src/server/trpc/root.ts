import { router } from './init'
import { capsuleRouter } from './routers/capsule'
import { storageRouter } from './routers/storage'

export const appRouter = router({
  capsule: capsuleRouter,
  storage: storageRouter,
})

export type AppRouter = typeof appRouter
