import { DrizzleProjectRepository } from '@/adapters/persistence/drizzle/DrizzleProjectRepository';
import { DrizzleModuleRepository } from '@/adapters/persistence/drizzle/DrizzleModuleRepository';
import { DrizzleTestCaseRepository } from '@/adapters/persistence/drizzle/DrizzleTestCaseRepository';
import { DrizzleTestRunRepository } from '@/adapters/persistence/drizzle/DrizzleTestRunRepository';
import { DrizzleTestResultRepository } from '@/adapters/persistence/drizzle/DrizzleTestResultRepository';
import { DrizzleAttachmentRepository } from '@/adapters/persistence/drizzle/DrizzleAttachmentRepository';
import { DrizzleDashboardRepository } from '@/adapters/persistence/drizzle/DrizzleDashboardRepository';
import { DrizzleSettingsRepository } from '@/adapters/persistence/drizzle/DrizzleSettingsRepository';

import { LocalStorageAdapter } from '@/adapters/storage/LocalStorageAdapter';
import { JiraAdapter } from '@/adapters/issue-tracker/JiraAdapter';
import { SlackNotifierAdapter } from '@/adapters/notifier/SlackNotifierAdapter';
import { WebhookDispatcherAdapter } from '@/adapters/webhook/WebhookDispatcherAdapter';
import { LLMProviderFactoryAdapter } from '@/adapters/llm/LLMProviderFactoryAdapter';

import { ProjectService } from '@/domain/services/ProjectService';
import { TestPlanService } from '@/domain/services/TestPlanService';
import { TestRunService } from '@/domain/services/TestRunService';
import { AttachmentService } from '@/domain/services/AttachmentService';
import { DashboardService } from '@/domain/services/DashboardService';
import { ReportService } from '@/domain/services/ReportService';
import { DatabaseService } from '@/domain/services/DatabaseService';
import { IntegrationSettingsService } from '@/domain/services/IntegrationSettingsService';
import { AITestGenerationService } from '@/domain/services/AITestGenerationService';
import { AIBugReportService } from '@/domain/services/AIBugReportService';

/**
 * IoC Container
 * Lazy-initialized singleton via globalThis to prevent duplicate instances
 * in Next.js App Router (each API route is a separate server function).
 * Same pattern as client.ts uses for the database connection.
 */
function createContainer() {
    // --- Repositories ---
    const projectRepo = new DrizzleProjectRepository();
    const settingsRepo = new DrizzleSettingsRepository();
    const moduleRepo = new DrizzleModuleRepository();
    const testCaseRepo = new DrizzleTestCaseRepository();
    const testRunRepo = new DrizzleTestRunRepository();
    const testResultRepo = new DrizzleTestResultRepository();
    const attachmentRepo = new DrizzleAttachmentRepository();
    const dashboardRepo = new DrizzleDashboardRepository();

    // --- External Adapters ---
    const storageProvider = new LocalStorageAdapter(process.env.FILES_PATH || './uploads');
    const integrationSettingsService = new IntegrationSettingsService(settingsRepo);
    const jiraAdapter = new JiraAdapter(integrationSettingsService);
    const slackNotifier = new SlackNotifierAdapter(integrationSettingsService);
    const webhookDispatcher = new WebhookDispatcherAdapter();
    const llmProviderFactory = new LLMProviderFactoryAdapter(settingsRepo);

    // --- Domain Services ---
    const projectService = new ProjectService(projectRepo);
    const aiTestGenerationService = new AITestGenerationService(llmProviderFactory);
    const testPlanService = new TestPlanService(moduleRepo, testCaseRepo);
    const testRunService = new TestRunService(testRunRepo, testResultRepo, testCaseRepo, slackNotifier, webhookDispatcher);
    const aiBugReportService = new AIBugReportService(llmProviderFactory, testRunRepo);
    const attachmentService = new AttachmentService(attachmentRepo, storageProvider);
    const dashboardService = new DashboardService(dashboardRepo, testCaseRepo, testRunRepo);
    const reportService = new ReportService(testRunRepo);
    const databaseService = new DatabaseService(moduleRepo, testCaseRepo, testRunRepo, testResultRepo, attachmentRepo);

    return {
        // Repositories (exposed for direct use in API routes if needed)
        projectRepo,
        settingsRepo,
        moduleRepo,
        testCaseRepo,
        testRunRepo,
        testResultRepo,
        attachmentRepo,
        dashboardRepo,
        // Adapters
        storageProvider,
        jiraAdapter,
        slackNotifier,
        webhookDispatcher,
        llmProviderFactory,
        // Services
        integrationSettingsService,
        projectService,
        aiTestGenerationService,
        testPlanService,
        testRunService,
        aiBugReportService,
        attachmentService,
        dashboardService,
        reportService,
        databaseService,
    };
}

type Container = ReturnType<typeof createContainer>;

const globalForContainer = globalThis as unknown as { container: Container | undefined };
const container = globalForContainer.container ?? createContainer();

if (process.env.NODE_ENV !== 'production') globalForContainer.container = container;

// --- Named exports for backwards compatibility ---
export const projectRepo = container.projectRepo;
export const settingsRepo = container.settingsRepo;
export const moduleRepo = container.moduleRepo;
export const testCaseRepo = container.testCaseRepo;
export const testRunRepo = container.testRunRepo;
export const testResultRepo = container.testResultRepo;
export const attachmentRepo = container.attachmentRepo;
export const dashboardRepo = container.dashboardRepo;

export const storageProvider = container.storageProvider;
export const jiraAdapter = container.jiraAdapter;
export const slackNotifier = container.slackNotifier;
export const webhookDispatcher = container.webhookDispatcher;
export const llmProviderFactory = container.llmProviderFactory;

export const integrationSettingsService = container.integrationSettingsService;
export const projectService = container.projectService;
export const aiTestGenerationService = container.aiTestGenerationService;
export const testPlanService = container.testPlanService;
export const testRunService = container.testRunService;
export const aiBugReportService = container.aiBugReportService;
export const attachmentService = container.attachmentService;
export const dashboardService = container.dashboardService;
export const reportService = container.reportService;
export const databaseService = container.databaseService;
