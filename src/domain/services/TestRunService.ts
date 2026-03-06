import type { ITestRunRepository } from '../ports/repositories/ITestRunRepository';
import type { ITestResultRepository } from '../ports/repositories/ITestResultRepository';
import type { ITestCaseRepository } from '../ports/repositories/ITestCaseRepository';
import type { INotifier } from '../ports/INotifier';
import type { IWebhookDispatcher } from '../ports/IWebhookDispatcher';
import type { TestRun, TestResult, TestRunWithResults, UpdateResultDTO } from '../types';
import { NotFoundError } from '../errors';

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
        private readonly webhookDispatcher: IWebhookDispatcher
    ) { }

    async getAllRuns(projectId: string): Promise<TestRun[]> {
        return this.testRunRepo.findAll(projectId);
    }

    async getRunById(id: string): Promise<TestRunWithResults> {
        const run = await this.testRunRepo.findById(id);
        if (!run) throw new NotFoundError('TestRun', id);
        return run;
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

        await this.webhookDispatcher.dispatch({
            event: 'testrun.created',
            payload: { id: run.id, name: run.name, projectId: run.projectId },
        });

        return run;
    }

    async renameRun(id: string, name: string): Promise<TestRun> {
        const existing = await this.testRunRepo.findById(id);
        if (!existing) throw new NotFoundError('TestRun', id);

        const run = await this.testRunRepo.update(id, { name });
        await this.webhookDispatcher.dispatch({
            event: 'testrun.updated',
            payload: { id: run.id, name: run.name },
        });
        return run;
    }

    async updateResult(resultId: string, data: UpdateResultDTO): Promise<TestResult> {
        const result = await this.testResultRepo.update(resultId, data);
        await this.webhookDispatcher.dispatch({
            event: 'testresult.updated',
            payload: { id: result.id, status: result.status, notes: result.notes ?? null },
        });
        return result;
    }

    async deleteRun(id: string): Promise<void> {
        const run = await this.testRunRepo.findById(id);
        if (!run) throw new NotFoundError('TestRun', id);

        await this.testRunRepo.delete(id);

        await this.webhookDispatcher.dispatch({
            event: 'testrun.deleted',
            payload: { id, name: run.name },
        });
    }

    async finishRun(runId: string): Promise<void> {
        const run = await this.getRunById(runId);

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
                    { title: 'Blocked', value: String(blocked), short: true },
                ],
            });
        }

        await this.webhookDispatcher.dispatch({
            event: 'testrun.completed',
            payload: {
                runId: run.id,
                name: run.name,
                stats: { total, passed, failed, blocked, untested },
            },
        });
    }
}
