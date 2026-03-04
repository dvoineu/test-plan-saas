import type { TestRunWithResults, TestRun, TestCase, PriorityDistribution, RecentRunSummary, ActivityItem, ModuleCoverage } from '../../types';

export interface IDashboardRepository {
    getLatestRun(projectId: string): Promise<TestRunWithResults | null>;
    getHistoricalRuns(projectId: string, limit?: number): Promise<TestRun[]>;
    getFlakyTests(projectId: string): Promise<Array<{ testCase: TestCase; failureRate: number }>>;
    getPriorityDistribution(projectId: string): Promise<PriorityDistribution[]>;
    getRecentRuns(projectId: string, limit?: number): Promise<RecentRunSummary[]>;
    getActivities(projectId: string, limit?: number): Promise<ActivityItem[]>;
    getCasesDelta(projectId: string, days?: number): Promise<number>;
    getRunsDelta(projectId: string, days?: number): Promise<number>;
    getModuleCoverage(projectId: string): Promise<ModuleCoverage[]>;
}

