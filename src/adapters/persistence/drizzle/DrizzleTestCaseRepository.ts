import { db } from '@/infrastructure/db/client';
import { testCases, modules } from '@/infrastructure/db/schema';
import { eq } from 'drizzle-orm';
import type { ITestCaseRepository } from '@/domain/ports/repositories/ITestCaseRepository';
import type { TestCase, CreateTestCaseDTO } from '@/domain/types';

export class DrizzleTestCaseRepository implements ITestCaseRepository {
    async findByTestId(testId: string): Promise<TestCase | null> {
        const result = await db.select().from(testCases).where(eq(testCases.testId, testId)).limit(1);
        return result[0] ?? null;
    }

    async findAll(projectId?: string): Promise<TestCase[]> {
        if (!projectId) {
            return db.select().from(testCases);
        }

        return db.select({
            id: testCases.id,
            testId: testCases.testId,
            title: testCases.title,
            steps: testCases.steps,
            expectedResult: testCases.expectedResult,
            priority: testCases.priority,
            moduleId: testCases.moduleId,
        })
            .from(testCases)
            .innerJoin(modules, eq(testCases.moduleId, modules.id))
            .where(eq(modules.projectId, projectId));
    }

    async create(data: CreateTestCaseDTO): Promise<TestCase> {
        const result = await db.insert(testCases).values({
            testId: data.testId,
            title: data.title,
            steps: data.steps,
            expectedResult: data.expectedResult,
            priority: data.priority,
            moduleId: data.moduleId,
        }).returning();
        return result[0];
    }

    async count(): Promise<number> {
        const result = await db.select({ count: testCases.id }).from(testCases);
        return result.length;
    }

    async deleteAll(): Promise<void> {
        await db.delete(testCases);
    }
}
