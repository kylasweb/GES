// For direct database connection
exports.databaseUrl = process.env.DATABASE_URL;

// Default export for compatibility
exports.default = {
  databaseUrl: exports.databaseUrl
};