import type { TestCase, CreateTestCaseDTO } from '../../types';

export interface ITestCaseRepository {
    findById(id: string): Promise<TestCase | null>;
    findByTestId(testId: string): Promise<TestCase | null>;
    findAll(projectId?: string): Promise<TestCase[]>;
    create(data: CreateTestCaseDTO): Promise<TestCase>;
    update(id: string, data: Partial<CreateTestCaseDTO>): Promise<TestCase>;
    delete(id: string): Promise<void>;
    count(): Promise<number>;
    deleteAll(): Promise<void>;
}
