import type { ILLMProviderFactory } from '../ports/ILLMProviderFactory';
import type { ITestRunRepository } from '../ports/repositories/ITestRunRepository';
import { NotFoundError } from '../errors';

/**
 * Service: AI Bug Report
 * Generates bug reports from failed/blocked test results using an LLM.
 * Depends only on ports — no knowledge of concrete implementations.
 */
export class AIBugReportService {
    constructor(
        private readonly llmProviderFactory: ILLMProviderFactory,
        private readonly testRunRepo: ITestRunRepository,
    ) { }

    async generateBugReport(runId: string, contextPrompt?: string): Promise<string> {
        const run = await this.testRunRepo.findById(runId);
        if (!run) throw new NotFoundError('TestRun', runId);

        const failedResults = run.testResults.filter(r => r.status === 'FAILED' || r.status === 'BLOCKED');
        if (failedResults.length === 0) {
            return '# No bugs found!\n\nAll tests passed successfully or were untested.';
        }

        const provider = await this.llmProviderFactory.create();

        const systemPrompt = `You are a Senior QA Engineer.
Your task is to analyze the following failed and blocked test cases from a test run, and generate a professional, structured Bug Report for the development team.
Format the output entirely in standard Markdown.
Requirements:
1. Start with a brief executive summary.
2. Group the bugs by module.
3. Prioritize critical bugs (Priority P1 > P2 > P3 > P4, BLOCKED > FAILED).
4. For each bug, include: Test ID, Title, Priority, Expected Result, and Actual Result/QA Notes.
5. Provide actionable steps to reproduce based on the test case steps.
6. Provide brief suggestions on where the developer might start investigating if obvious.`;

        const userPrompt = `Context/Developer Focus: ${contextPrompt || 'None'}

Test Run Name: ${run.name}
Total Failed/Blocked: ${failedResults.length}

--- FAILED TEST CASES DATA ---
${failedResults.map(r => `
--- Test Case: ${r.testCase.testId} - ${r.testCase.title} ---
Module: ${r.testCase.module?.name || 'Unknown'}
Status: ${r.status}
Priority: ${r.testCase.priority}
Steps:
${r.testCase.steps}
Expected Result: ${r.testCase.expectedResult}
Actual Result (QA Notes): ${r.notes || 'No notes provided by tester'}
`).join('\n')}
------------------------------

Generate the comprehensive Markdown bug report now.`;

        const response = await provider.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], {
            temperature: 0.3,
            responseFormat: 'text',
            maxTokens: 4000
        });

        return response.content;
    }
}
