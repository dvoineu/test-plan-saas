import { db } from '@/infrastructure/db/client';
import { settings } from '@/infrastructure/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { ISettingsRepository } from '@/domain/ports/repositories/ISettingsRepository';

export class DrizzleSettingsRepository implements ISettingsRepository {
    async get(key: string): Promise<string | null> {
        const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
        return result[0]?.value ?? null;
    }

    async set(key: string, value: string): Promise<void> {
        await db.insert(settings)
            .values({ key, value, updatedAt: new Date() })
            .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
    }

    async getAll(keys: string[]): Promise<Record<string, string>> {
        const results = await db.select().from(settings).where(inArray(settings.key, keys));
        const map: Record<string, string> = {};
        for (const r of results) {
            if (r) {
                map[r.key] = r.value;
            }
        }
        return map;
    }
}
