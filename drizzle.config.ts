import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/infrastructure/db/schema.ts',
    out: './drizzle',
    dialect: process.env.DB_PROVIDER === 'postgresql' ? 'postgresql' : 'sqlite',
    dbCredentials: {
        url: process.env.DATABASE_URL || 'file:./dev.db',
    },
});
