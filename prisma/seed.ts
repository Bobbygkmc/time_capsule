import { PrismaClient } from '@prisma/client'
import { addMonths, addYears, subMonths } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  // We'll use a placeholder user ID for now
  // In a real scenario, this would be your Supabase User ID
  const userId = '00000000-0000-0000-0000-000000000000'

  // Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: 'owner@example.com',
      name: 'Garden Owner',
    },
  })

  // Sample data from the design files
  const capsules = [
    {
      title: 'Letter to myself, year one sober',
      description: 'for yourself · written 22 Sep 2025',
      unlockAt: addMonths(new Date(), 4),
      status: 'LOCKED',
    },
    {
      title: 'End of the worst year',
      description: 'for yourself',
      unlockAt: addMonths(new Date(), 7),
      status: 'LOCKED',
    },
    {
      title: 'The cabin reunion',
      description: 'for 6 friends',
      unlockAt: addYears(new Date(), 3),
      status: 'LOCKED',
    },
  ]

  console.log('Seed: Planting the garden...')

  for (const cap of capsules) {
    await prisma.capsule.create({
      data: {
        ...cap as any,
        ownerId: userId,
        recipients: {
          create: [
            {
              name: 'Maya Lin',
              email: 'maya@example.com',
              accessToken: Math.random().toString(36).substring(7),
            },
          ],
        },
      },
    })
  }

  console.log('Seed: Garden planted successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
