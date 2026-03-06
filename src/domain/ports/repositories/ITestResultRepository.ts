import type { TestResult, UpdateResultDTO } from '../../types';

export interface ITestResultRepository {
    createMany(data: Array<{ testRunId: string; testCaseId: string }>): Promise<void>;
    update(id: string, data: UpdateResultDTO): Promise<TestResult>;
    deleteAll(): Promise<void>;
}
