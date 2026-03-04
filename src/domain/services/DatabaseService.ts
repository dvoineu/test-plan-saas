import type {
    IModuleRepository,
    ITestCaseRepository,
    ITestRunRepository,
    ITestResultRepository,
    IAttachmentRepository,
} from '../ports/repositories';

/**
 * Service: Database
 * Administrative operations — clear all data.
 */
export class DatabaseService {
    constructor(
        private readonly moduleRepo: IModuleRepository,
        private readonly testCaseRepo: ITestCaseRepository,
        private readonly testRunRepo: ITestRunRepository,
        private readonly testResultRepo: ITestResultRepository,
        private readonly attachmentRepo: IAttachmentRepository,
    ) { }

    /**
     * Delete ALL data from the database.
     * Order matters due to foreign key constraints.
     */
    async clearAllData(): Promise<void> {
        await this.attachmentRepo.deleteAll();
        await this.testResultRepo.deleteAll();
        await this.testRunRepo.deleteAll();
        await this.testCaseRepo.deleteAll();
        await this.moduleRepo.deleteAll();
    }
}
