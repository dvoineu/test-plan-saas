import type { ITestRunRepository } from '../ports/repositories/ITestRunRepository';
import type { ITestResultRepository } from '../ports/repositories/ITestResultRepository';
import type { ITestCaseRepository } from '../ports/repositories/ITestCaseRepository';
import type { INotifier } from '../ports/INotifier';
import type { TestRun, TestResult, TestRunWithResults, UpdateResultDTO } from '../types';

/**
 * Service: Test Run
 * Manages test run lifecycle: creation, result updates.
 * Creating a run automatically creates UNTESTED results for all existing test cases.
 */
export class TestRunService {
    constructor(
        private readonly testRunRepo: ITestRunRepository,
        private readonly testResultRepo: ITestResultRepository,
        private readonly testCaseRepo: ITestCaseRepository,
        private readonly notifier: INotifier,
        private readonly webhookService: any // Pass in webhooks to avoid circular dependency complex issues right now
    ) { }

    async getAllRuns(projectId: string): Promise<TestRun[]> {
        return this.testRunRepo.findAll(projectId);
    }

    async getRunById(id: string): Promise<TestRunWithResults | null> {
        return this.testRunRepo.findById(id);
    }

    async createRun(name: string, projectId: string): Promise<TestRun> {
        const run = await this.testRunRepo.create(name, projectId);
        const testCases = await this.testCaseRepo.findAll(projectId);

        if (testCases.length > 0) {
            const resultsData = testCases.map((tc) => ({
                testRunId: run.id,
                testCaseId: tc.id,
            }));
            await this.testResultRepo.createMany(resultsData);
        }

        return run;
    }

    async renameRun(id: string, name: string): Promise<TestRun> {
        const run = await this.testRunRepo.update(id, { name });
        await this.webhookService.dispatch({
            event: 'testrun.updated',
            payload: run
        });
        return run;
    }

    async updateResult(resultId: string, data: UpdateResultDTO): Promise<TestResult> {
        const result = await this.testResultRepo.update(resultId, data);
        await this.webhookService.dispatch({
            event: 'testresult.updated',
            payload: result
        });
        return result;
    }

    async deleteRun(id: string): Promise<void> {
        const run = await this.testRunRepo.findById(id);
        if (!run) return;

        await this.testRunRepo.delete(id);

        await this.webhookService.dispatch({
            event: 'testrun.deleted',
            payload: { id, name: run.name }
        });
    }

    async finishRun(runId: string): Promise<void> {
        const run = await this.getRunById(runId);
        if (!run) return;

        let passed = 0, failed = 0, blocked = 0, untested = 0;

        for (const res of run.testResults || []) {
            if (res.status === 'PASSED') passed++;
            else if (res.status === 'FAILED') failed++;
            else if (res.status === 'BLOCKED') blocked++;
            else untested++;
        }

        const total = passed + failed + blocked + untested;
        const severity = failed > 0 || blocked > 0 ? 'error' : (untested === 0 ? 'success' : 'warning');

        if (await this.notifier.isAvailable()) {
            await this.notifier.send({
                title: `Test Run Completed: ${run.name}`,
                message: `The test run has finished execution.`,
                severity,
                fields: [
                    { title: 'Total', value: String(total), short: true },
                    { title: 'Passed', value: String(passed), short: true },
                    { title: 'Failed', value: String(failed), short: true },
                    { title: 'Blocked', value: String(blocked), short: true }
                ]
            });
        }

        await this.webhookService.dispatch({
            event: 'testrun.completed',
            payload: {
                runId: run.id,
                name: run.name,
                stats: { total, passed, failed, blocked, untested }
            }
        });
    }
}
