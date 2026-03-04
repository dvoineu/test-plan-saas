import { db } from '@/infrastructure/db/client';
import { modules } from '@/infrastructure/db/schema';
import { eq, and } from 'drizzle-orm';
import { IModuleRepository } from '@/domain/ports/repositories/IModuleRepository';
import { Module } from '@/domain/types';

export class DrizzleModuleRepository implements IModuleRepository {
    async findByName(name: string, projectId: string): Promise<Module | null> {
        const result = await db.select()
            .from(modules)
            .where(
                and(
                    eq(modules.name, name),
                    eq(modules.projectId, projectId)
                )
            )
            .limit(1);
        return result[0] ?? null;
    }

    async findAll(projectId: string): Promise<Module[]> {
        return db.select().from(modules).where(eq(modules.projectId, projectId));
    }

    async create(name: string, projectId: string, description?: string): Promise<Module> {
        const result = await db.insert(modules).values({ name, description, projectId }).returning();
        return result[0];
    }

    async deleteAll(): Promise<void> {
        await db.delete(modules);
    }
}
