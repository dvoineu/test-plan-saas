import { ModuleRepository } from '@/domains/test-design/repositories/module.repository';
import { TestCaseRepository } from '@/domains/test-design/repositories/test-case.repository';
import { TestRunRepository } from '@/domains/test-execution/repositories/test-run.repository';
import { TestResultRepository } from '@/domains/test-execution/repositories/test-result.repository';
import { AttachmentRepository } from '@/domains/test-execution/repositories/attachment.repository';

export class DatabaseService {
  private moduleRepo = new ModuleRepository();
  private testCaseRepo = new TestCaseRepository();
  private testRunRepo = new TestRunRepository();
  private testResultRepo = new TestResultRepository();
  private attachmentRepo = new AttachmentRepository();

  async clearAllData() {
    await this.attachmentRepo.deleteAll();
    await this.testResultRepo.deleteAll();
    await this.testRunRepo.deleteAll();
    await this.testCaseRepo.deleteAll();
    await this.moduleRepo.deleteAll();
  }
}
