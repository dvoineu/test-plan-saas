import { DrizzleProjectRepository } from '@/adapters/persistence/drizzle/DrizzleProjectRepository';
import { DrizzleModuleRepository } from '@/adapters/persistence/drizzle/DrizzleModuleRepository';
import { DrizzleTestCaseRepository } from '@/adapters/persistence/drizzle/DrizzleTestCaseRepository';
import { DrizzleTestRunRepository } from '@/adapters/persistence/drizzle/DrizzleTestRunRepository';
import { DrizzleTestResultRepository } from '@/adapters/persistence/drizzle/DrizzleTestResultRepository';
import { DrizzleAttachmentRepository } from '@/adapters/persistence/drizzle/DrizzleAttachmentRepository';
import { DrizzleDashboardRepository } from '@/adapters/persistence/drizzle/DrizzleDashboardRepository';

import { LocalStorageAdapter } from '@/adapters/storage/LocalStorageAdapter';
import { DrizzleSettingsRepository } from '@/adapters/persistence/drizzle/DrizzleSettingsRepository';

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
import { JiraAdapter } from '@/adapters/issue-tracker/JiraAdapter';
import { SlackNotifierAdapter } from '@/adapters/notifier/SlackNotifierAdapter';
import { WebhookService } from '@/domain/services/WebhookService';

// --- Repositories ---
export const projectRepo = new DrizzleProjectRepository();
export const settingsRepo = new DrizzleSettingsRepository();
export const moduleRepo = new DrizzleModuleRepository();
export const testCaseRepo = new DrizzleTestCaseRepository();
export const testRunRepo = new DrizzleTestRunRepository();
export const testResultRepo = new DrizzleTestResultRepository();
export const attachmentRepo = new DrizzleAttachmentRepository();
export const dashboardRepo = new DrizzleDashboardRepository();

// --- External Adapters ---
export const storageProvider = new LocalStorageAdapter(process.env.FILES_PATH || './uploads');

// --- Domain Services ---
export const integrationSettingsService = new IntegrationSettingsService(settingsRepo);

// --- Integrations ---
export const jiraAdapter = new JiraAdapter(integrationSettingsService);
export const slackNotifier = new SlackNotifierAdapter(integrationSettingsService);

// We define an empty array of webhook URLs. In a real system, these would fetch from the database.
export const webhookService = new WebhookService();

// --- Domain Services ---
export const projectService = new ProjectService(projectRepo);

export const aiTestGenerationService = new AITestGenerationService(integrationSettingsService);

export const testPlanService = new TestPlanService(moduleRepo, testCaseRepo);

export const testRunService = new TestRunService(testRunRepo, testResultRepo, testCaseRepo, slackNotifier, webhookService);

export const aiBugReportService = new AIBugReportService(integrationSettingsService, testRunService);

export const attachmentService = new AttachmentService(attachmentRepo, storageProvider);

export const dashboardService = new DashboardService(dashboardRepo, testCaseRepo, testRunRepo);

export const reportService = new ReportService(testRunRepo);

export const databaseService = new DatabaseService(
    moduleRepo,
    testCaseRepo,
    testRunRepo,
    testResultRepo,
    attachmentRepo
);
