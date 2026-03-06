import * as path from 'path';

/**
 * Centralized Configuration
 * Consolidates all environment variables into a typed config object.
 */
export const config = {
    database: {
        provider: process.env.DB_PROVIDER || 'sqlite',
        url: process.env.DATABASE_URL || 'file:./dev.db',
        path: process.env.DATABASE_PATH || './prisma/dev.db',
    },
    llm: {
        provider: process.env.LLM_PROVIDER || 'gemini',
        apiKey: process.env.LLM_API_KEY || process.env.GEMINI_API_KEY,
        baseUrl: process.env.LLM_BASE_URL,
        model: process.env.LLM_MODEL || 'gemini-2.5-flash',
    },
    storage: {
        /** Files will be saved in public/uploads by default so they can be served by Next.js static routing */
        path: process.env.FILES_PATH || path.join(process.cwd(), 'public', 'uploads'),
    },
    app: {
        url: process.env.APP_URL || 'http://localhost:3000',
        env: process.env.NODE_ENV || 'development',
    }
} as const;
