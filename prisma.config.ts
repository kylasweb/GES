import { AccelerateAdapter } from '@prisma/adapter-accelerate'
import { PrismaClient } from '@prisma/client'

// For direct database connection
export const databaseUrl = process.env.DATABASE_URL

// For Prisma Accelerate (if using)
export const accelerateUrl = process.env.ACCELERATE_URL

// You can also export a pre-configured client if needed
// export const prisma = new PrismaClient({
//   adapter: databaseUrl ? new AccelerateAdapter(databaseUrl) : undefined,
// })