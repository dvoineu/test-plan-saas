import { z } from 'zod';

// ─── Projects ────────────────────────────────────────────────

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().max(1000).optional(),
});

// ─── Test Runs ───────────────────────────────────────────────

export const createRunSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    projectId: z.string().min(1, 'Project ID is required'),
});

export const renameRunSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
});

// ─── Test Results ────────────────────────────────────────────

export const updateResultSchema = z.object({
    resultId: z.string().min(1, 'Result ID is required'),
    status: z.enum(['PASSED', 'FAILED', 'BLOCKED', 'UNTESTED']).optional(),
    notes: z.string().optional(),
});

// ─── Settings ────────────────────────────────────────────────

export const updateSettingsSchema = z.object({
    provider: z.string().optional(),
    model: z.string().optional(),
    baseUrl: z.string().optional(),
    apiKey: z.string().optional(),
    jiraUrl: z.string().optional(),
    jiraEmail: z.string().optional(),
    jiraToken: z.string().optional(),
    jiraProject: z.string().optional(),
    slackWebhook: z.string().optional(),
});

// ─── AI Generate ─────────────────────────────────────────────

export const generatePlanSchema = z.object({
    files: z.array(z.object({
        path: z.string(),
        content: z.string(),
    })).min(1, 'No files provided for analysis').max(50, 'Max 50 files allowed per request'),
    contextPrompt: z.string().optional(),
    saveImmediately: z.boolean().optional(),
    projectId: z.string().optional(),
}).refine(
    (data) => !data.saveImmediately || data.projectId,
    { message: 'projectId is required if saveImmediately is true', path: ['projectId'] },
);

// ─── Bug Report ──────────────────────────────────────────────

export const generateBugReportSchema = z.object({
    contextPrompt: z.string().optional(),
});

// ─── Jira Issue ──────────────────────────────────────────────

export const createJiraIssueSchema = z.object({
    summary: z.string().min(1, 'Summary is required'),
    description: z.string().optional(),
    issueType: z.string().optional(),
});

// ─── Test Cases ──────────────────────────────────────────────

export const createTestCaseSchema = z.object({
    testId: z.string().min(1, 'Test ID is required').max(50),
    title: z.string().min(1, 'Title is required').max(500),
    steps: z.string().min(1, 'Steps are required'),
    expectedResult: z.string().min(1, 'Expected result is required'),
    priority: z.enum(['P1', 'P2', 'P3', 'P4']),
    moduleId: z.string().min(1, 'Module ID is required'),
});

export const updateTestCaseSchema = z.object({
    testId: z.string().min(1).max(50).optional(),
    title: z.string().min(1).max(500).optional(),
    steps: z.string().min(1).optional(),
    expectedResult: z.string().min(1).optional(),
    priority: z.enum(['P1', 'P2', 'P3', 'P4']).optional(),
    moduleId: z.string().min(1).optional(),
});

