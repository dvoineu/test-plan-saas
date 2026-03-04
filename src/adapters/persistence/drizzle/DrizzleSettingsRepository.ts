import { db } from '@/infrastructure/db/client';
import { settings } from '@/infrastructure/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { ISettingsRepository } from '@/domain/ports/repositories/ISettingsRepository';

export class DrizzleSettingsRepository implements ISettingsRepository {
    async get(key: string): Promise<string | null> {
        const result = await db.select().from(settings).where(eq(settings.id, key)).limit(1);
        return result[0]?.value ?? null;
    }

    async set(key: string, value: string): Promise<void> {
        await db.insert(settings)
            .values({ id: key, value })
            .onConflictDoUpdate({ target: settings.id, set: { value } });
    }

    async getAll(keys: string[]): Promise<Record<string, string>> {
        const results = await db.select().from(settings).where(inArray(settings.id, keys));
        const map: Record<string, string> = {};
        for (const r of results) {
            if (r) {
                map[r.id] = r.value;
            }
        }
        return map;
    }
}
