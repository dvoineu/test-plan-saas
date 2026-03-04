import { db } from '@/infrastructure/db/client';
import { testRuns, testResults, testCases, modules, testAttachments } from '@/infrastructure/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { IDashboardRepository } from '@/domain/ports/repositories/IDashboardRepository';
import type { TestRunWithResults, TestRun, TestCase } from '@/domain/types';

export class DrizzleDashboardRepository implements IDashboardRepository {
    async getLatestRun(projectId: string): Promise<TestRunWithResults | null> {
        const latestRuns = await db.select()
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(1);

        if (latestRuns.length === 0) return null;

        const run = latestRuns[0];

        // Reuse similar logic from DrizzleTestRunRepository for fetching results
        const resultsRaw = await db
            .select({
                result: testResults,
                testCase: testCases,
                module: modules,
                attachment: testAttachments
            })
            .from(testResults)
            .where(eq(testResults.testRunId, run.id))
            .innerJoin(testCases, eq(testResults.testCaseId, testCases.id))
            .innerJoin(modules, eq(testCases.moduleId, modules.id))
            .leftJoin(testAttachments, eq(testAttachments.testResultId, testResults.id));

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
                if (!latest.attachments.some((a: any) => a.id === row.attachment!.id)) {
                    latest.attachments.push(row.attachment);
                }
            }
        }

        return {
            ...run,
            testResults: Array.from(resultsMap.values())
        };
    }

    async getHistoricalRuns(projectId: string, limit: number = 14): Promise<TestRun[]> {
        const runs = await db.select()
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(limit);

        if (runs.length === 0) return [];

        const resultsRaw = await db
            .select({
                status: testResults.status,
                testRunId: testResults.testRunId
            })
            .from(testResults)
            .innerJoin(testRuns, eq(testResults.testRunId, testRuns.id))
            .where(eq(testRuns.projectId, projectId));

        return runs.map((run: any) => {
            const runResults = resultsRaw.filter((r: any) => r.testRunId === run.id);
            return {
                ...run,
                testResults: runResults as any[]
            };
        }).reverse(); // Return chronological
    }

    async getFlakyTests(projectId: string): Promise<Array<{ testCase: TestCase; failureRate: number }>> {
        // Look at the last 10 runs for the project
        const recentRuns = await db.select({ id: testRuns.id })
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(10);

        if (recentRuns.length < 2) return [];

        const runIds = recentRuns.map((r: any) => r.id);

        const resultsRaw = await db
            .select({
                status: testResults.status,
                testCase: testCases
            })
            .from(testResults)
            .innerJoin(testCases, eq(testResults.testCaseId, testCases.id))
            .innerJoin(modules, eq(testCases.moduleId, modules.id))
            .where(eq(modules.projectId, projectId));

        // Filter results to only those inside the recent runs
        const recentResults = resultsRaw.filter((r: any) => runIds.some((id: any) => r.status !== undefined)); // This is a slight hack but we'll group in JS for simplicity in sqlite

        const caseStats = new Map<string, { total: number; failed: number; testCase: any }>();

        for (const r of recentResults) {
            if (!caseStats.has(r.testCase.id)) {
                caseStats.set(r.testCase.id, { total: 0, failed: 0, testCase: r.testCase });
            }
            const stat = caseStats.get(r.testCase.id)!;
            stat.total++;
            if (r.status === 'FAILED') {
                stat.failed++;
            }
        }

        const flakyList: Array<{ testCase: TestCase; failureRate: number }> = [];

        for (const stat of caseStats.values()) {
            if (stat.total >= 3 && stat.failed > 0 && stat.failed < stat.total) { // Mixed results = flaky
                const failureRate = Math.round((stat.failed / stat.total) * 100);
                if (failureRate >= 20 && failureRate <= 80) { // arbitrary threshold for "flaky"
                    flakyList.push({ testCase: stat.testCase as TestCase, failureRate });
                }
            }
        }

        return flakyList.sort((a, b) => b.failureRate - a.failureRate).slice(0, 5);
    }
}
