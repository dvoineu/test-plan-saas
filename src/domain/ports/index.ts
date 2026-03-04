// Repository ports
export type {
    IModuleRepository,
    ITestCaseRepository,
    ITestRunRepository,
    ITestResultRepository,
    IAttachmentRepository,
    IDashboardRepository,
} from './repositories';

// External service ports
export type { ILLMProvider, LLMMessage, LLMResponse } from './ILLMProvider';
export type { IStorageProvider } from './IStorageProvider';
export type { INotifier, NotificationPayload } from './INotifier';
export type { IIssueTracker, CreateIssueDTO, CreatedIssue } from './IIssueTracker';
