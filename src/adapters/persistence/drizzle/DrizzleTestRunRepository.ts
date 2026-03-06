import { db } from '@/infrastructure/db/client';
import { testRuns, testResults, testCases, modules, testAttachments } from '@/infrastructure/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { ITestRunRepository } from '@/domain/ports/repositories/ITestRunRepository';
import type { TestRun, TestRunWithResults } from '@/domain/types';

export class DrizzleTestRunRepository implements ITestRunRepository {
    async findAll(projectId: string): Promise<TestRun[]> {
        const result = await db.select()
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt));
        return result;
    }

    async findById(id: string): Promise<TestRunWithResults | null> {
        const runs = await db.select().from(testRuns).where(eq(testRuns.id, id)).limit(1);
        if (runs.length === 0) return null;
        const run = runs[0];

        const resultsRaw = await db
            .select({
                result: testResults,
                testCase: testCases,
                module: modules,
                attachment: testAttachments
            })
            .from(testResults)
            .where(eq(testResults.testRunId, id))
            .innerJoin(testCases, eq(testResults.testCaseId, testCases.id))
            .innerJoin(modules, eq(testCases.moduleId, modules.id))
            .leftJoin(testAttachments, eq(testAttachments.testResultId, testResults.id));

        // Map relationships correctly
        const resultsMap = new Map<string, any>();

        for (const row of resultsRaw) {
            if (!resultsMap.has(row.result.id)) {
                resultsMap.set(row.result.id, {
                    ...row.result,
                    status: row.result.status as any,
                    testCase: {
                        ...row.testCase,
                        module: row.module
                    },
                    attachments: []
                });
            }

            const latest = resultsMap.get(row.result.id);
            if (row.attachment) {
                // deduplicate attachments
                if (!latest.attachments.some((a: any) => a.id === row.attachment!.id)) {
                    latest.attachments.push(row.attachment);
                }
            }
        }

        // Sort by testId
        const testResultsArray = Array.from(resultsMap.values()).sort((a, b) =>
            a.testCase.testId.localeCompare(b.testCase.testId)
        );

        return {
            ...run,
            testResults: testResultsArray
        };
    }

    async create(name: string, projectId: string): Promise<TestRun> {
        const result = await db.insert(testRuns).values({ name, projectId }).returning();
        return result[0];
    }

    async update(id: string, data: { name: string }): Promise<TestRun> {
        const result = await db.update(testRuns)
            .set(data)
            .where(eq(testRuns.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string): Promise<void> {
        await db.delete(testRuns).where(eq(testRuns.id, id));
    }

    async count(): Promise<number> {
        const result = await db.select({ count: testRuns.id }).from(testRuns);
        return result.length;
    }

    async deleteAll(): Promise<void> {
        await db.delete(testRuns);
    }
}
