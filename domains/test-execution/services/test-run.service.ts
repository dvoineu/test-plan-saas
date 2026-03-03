import { TestRunRepository } from '../repositories/test-run.repository';
import { TestResultRepository } from '../repositories/test-result.repository';
import { TestCaseRepository } from '@/domains/test-design/repositories/test-case.repository';

export class TestRunService {
  private testRunRepo = new TestRunRepository();
  private testResultRepo = new TestResultRepository();
  private testCaseRepo = new TestCaseRepository();

  async getAllRuns() {
    return this.testRunRepo.findAll();
  }

  async getRunById(id: string) {
    return this.testRunRepo.findById(id);
  }

  async createRun(name: string) {
    const run = await this.testRunRepo.create(name);
    const testCases = await this.testCaseRepo.findAll();

    if (testCases.length > 0) {
      const resultsData = testCases.map((tc) => ({
        testRunId: run.id,
        testCaseId: tc.id,
      }));
      await this.testResultRepo.createMany(resultsData);
    }

    return run;
  }

  async updateResult(resultId: string, data: { status?: string; notes?: string }) {
    return this.testResultRepo.update(resultId, data);
  }
}
