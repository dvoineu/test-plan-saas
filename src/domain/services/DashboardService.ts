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

    async getDashboardStats(projectId: string, days: number = 14): Promise<DashboardData> {
        // Fetch all data in parallel for performance
        const [
            totalCases,
            totalRuns,
            latestRun,
            historicalRuns,
            rawFlakyTests,
            priorityDistribution,
            recentRuns,
            activities,
            casesDelta,
            runsDelta,
            coverageByModule,
        ] = await Promise.all([
            this.testCaseRepo.count(),
            this.testRunRepo.count(projectId),
            this.dashboardRepo.getLatestRun(projectId),
            this.dashboardRepo.getHistoricalRuns(projectId, days),
            this.dashboardRepo.getFlakyTests(projectId),
            this.dashboardRepo.getPriorityDistribution(projectId),
            this.dashboardRepo.getRecentRuns(projectId, 5),
            this.dashboardRepo.getActivities(projectId, 10),
            this.dashboardRepo.getCasesDelta(projectId, 7),
            this.dashboardRepo.getRunsDelta(projectId, 7),
            this.dashboardRepo.getModuleCoverage(projectId),
        ]);

        // --- Status breakdown from latest run ---
        let statusData = [
            { name: 'Passed', value: 0, fill: '#22c55e' },
            { name: 'Failed', value: 0, fill: '#ef4444' },
            { name: 'Blocked', value: 0, fill: '#f97316' },
            { name: 'Untested', value: 0, fill: '#94a3b8' },
        ];

        let moduleData: ModuleStats[] = [];
        let passRate = 0;

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

            const totalResults = counts.PASSED + counts.FAILED + counts.BLOCKED + counts.UNTESTED;
            passRate = totalResults > 0 ? Math.round((counts.PASSED / totalResults) * 100) : 0;

            moduleData = Object.keys(moduleStatsMap).map((mod) => ({
                name: mod.length > 15 ? mod.substring(0, 15) + '...' : mod,
                passed: moduleStatsMap[mod].passed,
                total: moduleStatsMap[mod].total,
                successRate: Math.round((moduleStatsMap[mod].passed / moduleStatsMap[mod].total) * 100),
            }));
        }

        // --- Historical pass rate ---
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

        // --- Flaky tests ---
        const flakyTests = rawFlakyTests.map(ft => ({
            testId: ft.testCase.testId,
            title: ft.testCase.title,
            failureRate: ft.failureRate
        }));

        // --- Pass rate delta (current vs previous run) ---
        let passRateDelta = 0;
        if (recentRuns.length >= 2) {
            passRateDelta = recentRuns[0].passRate - recentRuns[1].passRate;
        }

        // --- Last run date ---
        const lastRunDate = latestRun ? new Date(latestRun.createdAt).toISOString() : null;

        // --- Health score (0-100 weighted formula) ---
        const healthScore = this.computeHealthScore(passRate, flakyTests.length, totalCases, totalRuns, lastRunDate);

        return {
            totalCases,
            totalRuns,
            latestRun,
            statusData,
            moduleData,
            history,
            flakyTests,
            passRate,
            lastRunDate,
            casesDelta,
            runsDelta,
            passRateDelta,
            priorityDistribution,
            recentRuns,
            activities,
            coverageByModule,
            healthScore,
        };
    }

    private computeHealthScore(
        passRate: number,
        flakyCount: number,
        totalCases: number,
        totalRuns: number,
        lastRunDate: string | null,
    ): number {
        if (totalCases === 0) return 0;
        if (totalRuns === 0) return 10; // Have cases but no runs = very low score

        // Weights: passRate 50%, flaky penalty 20%, freshness 20%, coverage 10%
        const passScore = passRate * 0.5;

        // Flaky penalty: 0 flaky = 20pts, 5+ flaky = 0pts
        const flakyScore = Math.max(0, 20 - flakyCount * 4);

        // Freshness: how recent was the last run?
        let freshnessScore = 0;
        if (lastRunDate) {
            const hoursSince = (Date.now() - new Date(lastRunDate).getTime()) / (1000 * 60 * 60);
            if (hoursSince < 1) freshnessScore = 20;
            else if (hoursSince < 24) freshnessScore = 16;
            else if (hoursSince < 72) freshnessScore = 12;
            else if (hoursSince < 168) freshnessScore = 8;
            else freshnessScore = 4;
        }

        // Coverage (have runs vs cases)
        const coverageScore = totalRuns > 0 ? 10 : 0;

        return Math.min(100, Math.round(passScore + flakyScore + freshnessScore + coverageScore));
    }
}
