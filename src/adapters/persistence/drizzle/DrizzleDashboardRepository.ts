import { db } from '@/infrastructure/db/client';
import { testRuns, testResults, testCases, modules, testAttachments } from '@/infrastructure/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { IDashboardRepository } from '@/domain/ports/repositories/IDashboardRepository';
import type { TestRunWithResults, TestRun, TestCase, PriorityDistribution, RecentRunSummary, ActivityItem, ModuleCoverage } from '@/domain/types';

const PRIORITY_COLORS: Record<string, string> = {
    P1: '#ef4444',
    P2: '#f97316',
    P3: '#3b82f6',
    P4: '#94a3b8',
};

export class DrizzleDashboardRepository implements IDashboardRepository {

    // ──── Original methods ──────────────────────────────────────

    async getLatestRun(projectId: string): Promise<TestRunWithResults | null> {
        const latestRuns = await db.select()
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(1);

        if (latestRuns.length === 0) return null;

        const run = latestRuns[0];

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
                    testCase: { ...row.testCase, module: row.module },
                    attachments: []
                });
            }
            const entry = resultsMap.get(row.result.id);
            if (row.attachment && !entry.attachments.some((a: any) => a.id === row.attachment!.id)) {
                entry.attachments.push(row.attachment);
            }
        }

        return { ...run, testResults: Array.from(resultsMap.values()) };
    }

    async getHistoricalRuns(projectId: string, limit: number = 14): Promise<TestRun[]> {
        const runs = await db.select()
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(limit);

        if (runs.length === 0) return [];

        const resultsRaw = await db
            .select({ status: testResults.status, testRunId: testResults.testRunId })
            .from(testResults)
            .innerJoin(testRuns, eq(testResults.testRunId, testRuns.id))
            .where(eq(testRuns.projectId, projectId));

        return runs.map((run: typeof runs[number]) => {
            const runResults = resultsRaw.filter((r: typeof resultsRaw[number]) => r.testRunId === run.id);
            return { ...run, testResults: runResults as any[] };
        }).reverse();
    }

    async getFlakyTests(projectId: string): Promise<Array<{ testCase: TestCase; failureRate: number }>> {
        const recentRuns = await db.select({ id: testRuns.id })
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(10);

        if (recentRuns.length < 2) return [];

        const runIds = new Set(recentRuns.map((r: { id: string }) => r.id));

        const resultsRaw = await db
            .select({ status: testResults.status, testCase: testCases, testRunId: testResults.testRunId })
            .from(testResults)
            .innerJoin(testCases, eq(testResults.testCaseId, testCases.id))
            .innerJoin(modules, eq(testCases.moduleId, modules.id))
            .where(eq(modules.projectId, projectId));

        const recentResults = resultsRaw.filter((r: typeof resultsRaw[number]) => runIds.has(r.testRunId));
        const caseStats = new Map<string, { total: number; failed: number; testCase: typeof testCases.$inferSelect }>();

        for (const r of recentResults) {
            if (!caseStats.has(r.testCase.id)) {
                caseStats.set(r.testCase.id, { total: 0, failed: 0, testCase: r.testCase });
            }
            const stat = caseStats.get(r.testCase.id)!;
            stat.total++;
            if (r.status === 'FAILED') stat.failed++;
        }

        const flakyList: Array<{ testCase: TestCase; failureRate: number }> = [];
        for (const stat of caseStats.values()) {
            if (stat.total >= 3 && stat.failed > 0 && stat.failed < stat.total) {
                const failureRate = Math.round((stat.failed / stat.total) * 100);
                if (failureRate >= 20 && failureRate <= 80) {
                    flakyList.push({ testCase: stat.testCase as TestCase, failureRate });
                }
            }
        }
        return flakyList.sort((a, b) => b.failureRate - a.failureRate).slice(0, 5);
    }

    // ──── New methods ───────────────────────────────────────────

    async getPriorityDistribution(projectId: string): Promise<PriorityDistribution[]> {
        const cases = await db
            .select({ priority: testCases.priority })
            .from(testCases)
            .innerJoin(modules, eq(testCases.moduleId, modules.id))
            .where(eq(modules.projectId, projectId));

        const counts: Record<string, number> = {};
        for (const c of cases) {
            counts[c.priority] = (counts[c.priority] || 0) + 1;
        }

        return Object.entries(counts)
            .map(([priority, count]) => ({
                priority,
                count,
                fill: PRIORITY_COLORS[priority] || '#6b7280',
            }))
            .sort((a, b) => {
                const order = ['P1', 'P2', 'P3', 'P4'];
                return order.indexOf(a.priority) - order.indexOf(b.priority);
            });
    }

    async getRecentRuns(projectId: string, limit: number = 5): Promise<RecentRunSummary[]> {
        const runs = await db.select()
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(limit);

        if (runs.length === 0) return [];

        const summaries: RecentRunSummary[] = [];

        for (const run of runs) {
            const results = await db
                .select({ status: testResults.status })
                .from(testResults)
                .where(eq(testResults.testRunId, run.id));

            const total = results.length;
            const passed = results.filter((r: { status: string }) => r.status === 'PASSED').length;
            const failed = results.filter((r: { status: string }) => r.status === 'FAILED').length;
            const blocked = results.filter((r: { status: string }) => r.status === 'BLOCKED').length;
            const untested = results.filter((r: { status: string }) => r.status === 'UNTESTED').length;

            summaries.push({
                id: run.id,
                name: run.name,
                createdAt: run.createdAt!,
                total,
                passed,
                failed,
                blocked,
                untested,
                passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
            });
        }
        return summaries;
    }

    async getActivities(projectId: string, limit: number = 10): Promise<ActivityItem[]> {
        const activities: ActivityItem[] = [];

        const recentRuns = await db.select()
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(limit);

        for (const run of recentRuns) {
            const results = await db
                .select({ status: testResults.status })
                .from(testResults)
                .where(eq(testResults.testRunId, run.id));

            const total = results.length;

            if (total > 0) {
                const passedCount = results.filter((r: { status: string }) => r.status === 'PASSED').length;
                const passRate = Math.round((passedCount / total) * 100);

                activities.push({
                    id: `run-complete-${run.id}`,
                    type: 'run_completed',
                    message: `Test Run "${run.name}" — ${passRate}% passed (${total} tests)`,
                    timestamp: run.createdAt!,
                    meta: { runId: run.id, passRate },
                });
            } else {
                activities.push({
                    id: `run-create-${run.id}`,
                    type: 'run_created',
                    message: `Test Run "${run.name}" created`,
                    timestamp: run.createdAt!,
                    meta: { runId: run.id },
                });
            }
        }

        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }

    async getCasesDelta(_projectId: string, _days: number = 7): Promise<number> {
        // TestCase table lacks createdAt — return 0. In future, add the column.
        return 0;
    }

    async getRunsDelta(projectId: string, days: number = 7): Promise<number> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const allRuns = await db.select({ createdAt: testRuns.createdAt })
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId));

        return allRuns.filter((r: { createdAt: Date | null }) => r.createdAt && r.createdAt >= since).length;
    }

    async getModuleCoverage(projectId: string): Promise<ModuleCoverage[]> {
        const allModules = await db.select()
            .from(modules)
            .where(eq(modules.projectId, projectId));

        if (allModules.length === 0) return [];

        // Get latest run
        const latestRuns = await db.select({ id: testRuns.id })
            .from(testRuns)
            .where(eq(testRuns.projectId, projectId))
            .orderBy(desc(testRuns.createdAt))
            .limit(1);

        const latestRunId = latestRuns.length > 0 ? latestRuns[0].id : null;

        // Fetch all case counts per module in one query
        const caseCounts: Array<{ moduleId: string; count: number }> = await db
            .select({ moduleId: testCases.moduleId, count: sql<number>`count(*)` })
            .from(testCases)
            .where(eq(modules.projectId, projectId))
            .innerJoin(modules, eq(testCases.moduleId, modules.id))
            .groupBy(testCases.moduleId);

        const caseCountMap = new Map<string, number>(caseCounts.map((c: { moduleId: string; count: number }) => [c.moduleId, c.count]));

        // If we have a latest run, get all results for it in one query
        let resultsByModule = new Map<string, { tested: number; passed: number }>();

        if (latestRunId) {
            const results = await db
                .select({
                    moduleId: testCases.moduleId,
                    status: testResults.status,
                })
                .from(testResults)
                .innerJoin(testCases, eq(testResults.testCaseId, testCases.id))
                .where(eq(testResults.testRunId, latestRunId));

            for (const r of results) {
                if (!resultsByModule.has(r.moduleId)) {
                    resultsByModule.set(r.moduleId, { tested: 0, passed: 0 });
                }
                const entry = resultsByModule.get(r.moduleId)!;
                if (r.status !== 'UNTESTED') entry.tested++;
                if (r.status === 'PASSED') entry.passed++;
            }
        }

        return allModules
            .map((mod: typeof allModules[number]) => {
                const totalCasesCount = caseCountMap.get(mod.id) || 0;
                const modResults = resultsByModule.get(mod.id) || { tested: 0, passed: 0 };
                return {
                    id: mod.id,
                    name: mod.name,
                    totalCases: totalCasesCount as number,
                    testedCases: modResults.tested,
                    passRate: (totalCasesCount as number) > 0 ? Math.round((modResults.passed / (totalCasesCount as number)) * 100) : 0,
                };
            })
            .sort((a: ModuleCoverage, b: ModuleCoverage) => b.totalCases - a.totalCases);
    }
}
