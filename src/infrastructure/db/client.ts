import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/neon-http';
import Database from 'better-sqlite3';
import * as schema from './schema';

function createDB() {
    const provider = process.env.DB_PROVIDER || 'sqlite';

    if (provider === 'postgres' || provider === 'postgresql') {
        // PostgreSQL for Docker/production
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Pool } = require('pg');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { drizzle: drizzleNodePg } = require('drizzle-orm/node-postgres');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
        return drizzleNodePg(pool, { schema }) as any;
    }

    // SQLite for Electron/dev
    const dbPath = process.env.DATABASE_PATH || './dev.db';
    const sqlite = new Database(dbPath, { timeout: 10000 });
    sqlite.pragma('journal_mode = WAL');  // Better SQLite performance
    sqlite.pragma('foreign_keys = ON');   // Enable cascading deletes
    return drizzleSqlite(sqlite, { schema });
}

// Singleton to prevent multi-connections in dev
const globalForDb = globalThis as unknown as { db: ReturnType<typeof createDB> | undefined };
export const db = globalForDb.db ?? createDB();

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
