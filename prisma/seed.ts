import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Plans...')

  await prisma.plan.upsert({
    where: { name: 'Starter' },
    update: {},
    create: {
      name: 'Starter',
      monthlyCost: 0,
      maxUnits: 1,
      maxProjects: 5,
      maxTasksPerProject: 20,
      maxMembers: 10,
    },
  })

  await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      monthlyCost: 49, // Adjust the cost according to business logic
      maxUnits: 5,
      maxProjects: 30,
      maxTasksPerProject: 200,
      maxMembers: 50,
    },
  })

  await prisma.plan.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      monthlyCost: 149, // Adjust the cost according to business logic
      maxUnits: null,   // Unlimited
      maxProjects: null, // Unlimited
      maxTasksPerProject: null, // Unlimited
      maxMembers: null, // Unlimited
    },
  })

  console.log('Plans seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
