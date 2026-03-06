import { db } from '@/infrastructure/db/client';
import { projects } from '@/infrastructure/db/schema';
import { eq } from 'drizzle-orm';
import { IProjectRepository } from '@/domain/ports/repositories/IProjectRepository';
import { Project, CreateProjectDTO } from '@/domain/types';

export class DrizzleProjectRepository implements IProjectRepository {
    async findById(id: string): Promise<Project | null> {
        const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
        if (result.length === 0) return null;

        return {
            ...result[0],
            createdAt: new Date(result[0].createdAt)
        };
    }

    async findAll(): Promise<Project[]> {
        const result = await db.select().from(projects);
        return result.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt)
        }));
    }

    async create(data: CreateProjectDTO): Promise<Project> {
        const result = await db.insert(projects).values(data).returning();
        return {
            ...result[0],
            createdAt: new Date(result[0].createdAt)
        };
    }

    async update(id: string, data: Partial<CreateProjectDTO>): Promise<Project> {
        const result = await db.update(projects)
            .set(data)
            .where(eq(projects.id, id))
            .returning();

        if (result.length === 0) throw new Error('Project not found');

        return {
            ...result[0],
            createdAt: new Date(result[0].createdAt)
        };
    }

    async delete(id: string): Promise<void> {
        await db.delete(projects).where(eq(projects.id, id));
    }
}
