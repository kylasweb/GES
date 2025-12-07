// Prisma client configuration for Vercel deployments
// This configuration enables proper database connection handling

module.exports = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    }
  }
}