import type { TestStatus, RunStats } from '../types';

/**
 * Domain Events
 * Typed events emitted by domain services, consumed by adapters/integrations.
 * This is the contract between the domain core and the outside world.
 */
export type DomainEventMap = {
    /** Emitted when a test result status changes */
    'test:status:changed': {
        resultId: string;
        runId: string;
        testCaseId: string;
        oldStatus: TestStatus;
        newStatus: TestStatus;
        updatedAt: Date;
    };

    /** Emitted when all tests in a run are completed (no UNTESTED left) */
    'test:run:completed': {
        runId: string;
        runName: string;
        stats: RunStats;
        completedAt: Date;
    };

    /** Emitted after a test plan is imported from a file */
    'test:plan:imported': {
        moduleIds: string[];
        testCaseCount: number;
        source: string;
        importedAt: Date;
    };

    /** Emitted when an attachment is uploaded */
    'attachment:uploaded': {
        attachmentId: string;
        resultId: string;
        fileType: string;
        uploadedAt: Date;
    };

    /** Emitted when a report is generated */
    'report:generated': {
        runId: string;
        format: 'html' | 'pdf' | 'markdown';
        generatedAt: Date;
    };

    /** Emitted when AI generates a test plan */
    'ai:plan:generated': {
        projectPath: string;
        modulesGenerated: number;
        casesGenerated: number;
        llmProvider: string;
        generatedAt: Date;
    };
};

export type DomainEventName = keyof DomainEventMap;
export type DomainEventPayload<K extends DomainEventName> = DomainEventMap[K];
