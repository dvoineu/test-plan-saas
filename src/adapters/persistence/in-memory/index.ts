import type { IModuleRepository } from '@/domain/ports/repositories/IModuleRepository';
import type { ITestCaseRepository } from '@/domain/ports/repositories/ITestCaseRepository';
import type { Module, TestCase, CreateTestCaseDTO } from '@/domain/types';

export class InMemoryModuleRepository implements IModuleRepository {
    private modules: Module[] = [];

    async findByName(name: string): Promise<Module | null> {
        return this.modules.find(m => m.name === name) ?? null;
    }

    async findAll(): Promise<Module[]> {
        return [...this.modules];
    }

    async create(name: string, projectId: string, description?: string): Promise<Module> {
        const module: Module = { id: Math.random().toString(), name, projectId, description: description ?? null };
        this.modules.push(module);
        return module;
    }

    async deleteAll(): Promise<void> {
        this.modules = [];
    }
}

export class InMemoryTestCaseRepository implements ITestCaseRepository {
    private cases: TestCase[] = [];

    async findByTestId(testId: string): Promise<TestCase | null> {
        return this.cases.find(c => c.testId === testId) ?? null;
    }

    async findAll(): Promise<TestCase[]> {
        return [...this.cases];
    }

    async create(data: CreateTestCaseDTO): Promise<TestCase> {
        const testCase: TestCase = { id: Math.random().toString(), ...data };
        this.cases.push(testCase);
        return testCase;
    }

    async count(): Promise<number> {
        return this.cases.length;
    }

    async deleteAll(): Promise<void> {
        this.cases = [];
    }
}
