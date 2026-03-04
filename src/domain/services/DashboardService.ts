import type { IDashboardRepository } from '../ports/repositories/IDashboardRepository';
import type { ITestCaseRepository } from '../ports/repositories/ITestCaseRepository';
import type { ITestRunRepository } from '../ports/repositories/ITestRunRepository';
import type { DashboardData, ModuleStats, TestResult } from '../types';

/**
 * Service: Dashboard
 * Provides aggregated statistics for the dashboard view.
 */
export class DashboardService {
    constructor(
        private readonly dashboardRepo: IDashboardRepository,
        private readonly testCaseRepo: ITestCaseRepository,
        private readonly testRunRepo: ITestRunRepository,
    ) { }

    async getDashboardStats(projectId: string): Promise<DashboardData> {
        const totalCases = await this.testCaseRepo.count();
        const totalRuns = await this.testRunRepo.count(projectId);
        const latestRun = await this.dashboardRepo.getLatestRun(projectId);
        const historicalRuns = await this.dashboardRepo.getHistoricalRuns(projectId, 14);
        const rawFlakyTests = await this.dashboardRepo.getFlakyTests(projectId);

        let statusData = [
            { name: 'Passed', value: 0, fill: '#22c55e' },
            { name: 'Failed', value: 0, fill: '#ef4444' },
            { name: 'Blocked', value: 0, fill: '#f97316' },
            { name: 'Untested', value: 0, fill: '#94a3b8' },
        ];

        let moduleData: ModuleStats[] = [];

        if (latestRun && latestRun.testResults) {
            const counts = { PASSED: 0, FAILED: 0, BLOCKED: 0, UNTESTED: 0 };
            const moduleStatsMap: Record<string, { passed: number; total: number }> = {};

            latestRun.testResults.forEach((result: TestResult) => {
                const status = result.status as keyof typeof counts;
                if (status in counts) {
                    counts[status]++;
                }

                const modName = result.testCase?.module?.name ?? 'Unknown';
                if (!moduleStatsMap[modName]) {
                    moduleStatsMap[modName] = { passed: 0, total: 0 };
                }
                moduleStatsMap[modName].total++;
                if (result.status === 'PASSED') {
                    moduleStatsMap[modName].passed++;
                }
            });

            statusData[0].value = counts.PASSED;
            statusData[1].value = counts.FAILED;
            statusData[2].value = counts.BLOCKED;
            statusData[3].value = counts.UNTESTED;

            moduleData = Object.keys(moduleStatsMap).map((mod) => ({
                name: mod.length > 15 ? mod.substring(0, 15) + '...' : mod,
                passed: moduleStatsMap[mod].passed,
                total: moduleStatsMap[mod].total,
                successRate: Math.round((moduleStatsMap[mod].passed / moduleStatsMap[mod].total) * 100),
            }));
        }

        const history = historicalRuns.map(run => {
            let passCount = 0;
            let totalCount = 0;

            if (run.testResults && run.testResults.length > 0) {
                totalCount = run.testResults.length;
                //@ts-ignore
                passCount = run.testResults.filter(r => r.status === 'PASSED').length;
            }

            return {
                date: new Date(run.createdAt).toLocaleDateString(),
                passRate: totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0
            };
        });

        const flakyTests = rawFlakyTests.map(ft => ({
            testId: ft.testCase.testId,
            title: ft.testCase.title,
            failureRate: ft.failureRate
        }));

        return {
            totalCases,
            totalRuns,
            latestRun,
            statusData,
            moduleData,
            history,
            flakyTests
        };
    }
}
