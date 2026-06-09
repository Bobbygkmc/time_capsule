import { z } from 'zod'
import { router, protectedProcedure } from '../init'
import { createClient } from '@/lib/supabase/server'

export const storageRouter = router({
  getUploadUrl: protectedProcedure
    .input(z.object({
      capsuleId: z.string(),
      filename: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { capsuleId, filename, mimeType } = input
      const supabase = await createClient()

      // Verify ownership of the capsule
      const capsule = await ctx.prisma.capsule.findUnique({
        where: { id: capsuleId, ownerId: ctx.user.id }
      })

      if (!capsule) {
        throw new Error('Capsule not found')
      }

      const path = `capsules/${capsuleId}/${Date.now()}-${filename}`
      
      const { data, error } = await supabase.storage
        .from('capsule-media')
        .createSignedUploadUrl(path)

      if (error) {
        throw new Error(error.message)
      }

      return {
        uploadUrl: data.signedUrl,
        path: path,
        token: data.token,
      }
    }),
})
