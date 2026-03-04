import type { TestCase, CreateTestCaseDTO } from '../../types';

export interface ITestCaseRepository {
    findByTestId(testId: string): Promise<TestCase | null>;
    findAll(projectId?: string): Promise<TestCase[]>;
    create(data: CreateTestCaseDTO): Promise<TestCase>;
    count(): Promise<number>;
    deleteAll(): Promise<void>;
}
