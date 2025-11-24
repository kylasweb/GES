import { PrismaClient } from '@prisma/client'
import config from '../../prisma.config.js'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: config.databaseUrl || process.env.DATABASE_URL!,
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db