import type { TestRun, TestRunWithResults } from '../../types';

export interface ITestRunRepository {
    findAll(projectId: string): Promise<TestRun[]>;
    findById(id: string): Promise<TestRunWithResults | null>;
    create(name: string, projectId: string): Promise<TestRun>;
    update(id: string, data: { name: string }): Promise<TestRun>;
    delete(id: string): Promise<void>;
    count(projectId?: string): Promise<number>;
    deleteAll(): Promise<void>;
}
