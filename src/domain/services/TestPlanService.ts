import type { IModuleRepository } from '../ports/repositories/IModuleRepository';
import type { ITestCaseRepository } from '../ports/repositories/ITestCaseRepository';

/**
 * Service: Test Plan
 * Parses test plan files (Markdown) and persists modules + test cases.
 * Pure domain logic — no dependency on Prisma, Next.js, or any framework.
 */
export class TestPlanService {
    constructor(
        private readonly moduleRepo: IModuleRepository,
        private readonly testCaseRepo: ITestCaseRepository,
    ) { }

    async createModule(name: string, projectId: string, description?: string) {
        let mod = await this.moduleRepo.findByName(name, projectId);
        if (!mod) {
            mod = await this.moduleRepo.create(name, projectId, description);
        }
        return mod;
    }

    async createTestCase(data: import('@/domain/types').CreateTestCaseDTO) {
        return this.testCaseRepo.create(data);
    }

    /**
     * Parse a Markdown test plan and save modules + test cases to the database.
     * Expected format:
     *   ## Module Name
     *   | ID | Title | Steps | Expected Result | Priority |
     *   |---|---|---|---|---|
     *   | TC-001 | ... | ... | ... | P1 |
     */
    async parseAndSaveMarkdown(markdown: string, projectId: string): Promise<{ modulesCreated: number; casesCreated: number }> {
        const lines = markdown.split('\n');
        let currentModule: { id: string; name: string; description: string | null } | null = null;
        let inTable = false;
        let modulesCreated = 0;
        let casesCreated = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check for Module Header (## or ## N.)
            const moduleMatch = line.match(/^##\s+(?:\d+\.)?\s*(?:Модуль:)?\s*(.+)$/i);
            if (moduleMatch) {
                const moduleName = moduleMatch[1].trim();

                currentModule = await this.moduleRepo.findByName(moduleName, projectId);

                if (!currentModule) {
                    currentModule = await this.moduleRepo.create(moduleName, projectId);
                    modulesCreated++;
                }

                inTable = false;
                continue;
            }

            // Check for Table Header
            if (
                line.startsWith('| ID |') ||
                line.startsWith('|ID|') ||
                line.startsWith('| ID') ||
                line.includes('| Название |')
            ) {
                inTable = true;
                // Skip the separator line (|---|---|...)
                if (i + 1 < lines.length && lines[i + 1].includes('|---|')) {
                    i++;
                }
                continue;
            }

            // Parse Table Row
            if (inTable && line.startsWith('|') && currentModule) {
                const parts = line.split('|').map((p) => p.trim());
                if (parts.length >= 6) {
                    const testId = parts[1];
                    const title = parts[2];
                    const steps = parts[3];
                    const expectedResult = parts[4];
                    const priority = parts[5];

                    if (testId && testId !== 'ID' && !testId.includes('---')) {
                        const existingTest = await this.testCaseRepo.findByTestId(testId);

                        if (!existingTest || existingTest.moduleId !== currentModule.id) {
                            await this.testCaseRepo.create({
                                testId,
                                title,
                                steps,
                                expectedResult,
                                priority,
                                moduleId: currentModule.id,
                            });
                            casesCreated++;
                        }
                    }
                }
            } else if (inTable && !line.startsWith('|') && line !== '') {
                inTable = false;
            }
        }

        return { modulesCreated, casesCreated };
    }
}
