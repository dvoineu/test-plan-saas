import { db } from '@/infrastructure/db/client';
import { testResults } from '@/infrastructure/db/schema';
import { eq } from 'drizzle-orm';
import type { ITestResultRepository } from '@/domain/ports/repositories/ITestResultRepository';
import type { TestResult, UpdateResultDTO, TestStatus } from '@/domain/types';

export class DrizzleTestResultRepository implements ITestResultRepository {
    async createMany(data: Array<{ testRunId: string; testCaseId: string }>): Promise<void> {
        if (data.length === 0) return;
        await db.insert(testResults).values(data.map(d => ({
            ...d,
            status: 'UNTESTED'
        })));
    }

    async update(id: string, data: UpdateResultDTO): Promise<TestResult> {
        const updates: Partial<typeof testResults.$inferInsert> = {};
        if (data.status) updates.status = data.status;
        if (data.notes !== undefined) updates.notes = data.notes;

        const result = await db.update(testResults)
            .set(updates)
            .where(eq(testResults.id, id))
            .returning();

        return {
            ...result[0],
            status: result[0].status as TestStatus
        };
    }

    async deleteAll(): Promise<void> {
        await db.delete(testResults);
    }
}
