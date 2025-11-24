// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

// For direct database connection
export const databaseUrl = process.env.DATABASE_URL;

// Default export for compatibility
export default {
    databaseUrl
};

// You can also export a pre-configured client if needed
// exports.prisma = new PrismaClient({
//   datasources: {
//     db: {
//       url: databaseUrl,
//     },
//   },
// });