import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Production-optimized Prisma client configuration
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL!,
      }
    },
    // Connection pooling for production
    ...(process.env.NODE_ENV === 'production' && {
      transactionOptions: {
        isolationLevel: 'ReadCommitted',
      },
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db