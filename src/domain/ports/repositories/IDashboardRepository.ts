import type { TestRunWithResults, TestRun, TestCase } from '../../types';

export interface IDashboardRepository {
    getLatestRun(projectId: string): Promise<TestRunWithResults | null>;
    getHistoricalRuns(projectId: string, limit?: number): Promise<TestRun[]>;
    getFlakyTests(projectId: string): Promise<Array<{ testCase: TestCase; failureRate: number }>>;
}
