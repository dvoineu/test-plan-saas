import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const settings = sqliteTable('Setting', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const projects = sqliteTable('Project', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const modules = sqliteTable('Module', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    description: text('description'),
    projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
});

export const testCases = sqliteTable('TestCase', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    testId: text('testId').notNull(),
    title: text('title').notNull(),
    steps: text('steps').notNull(),
    expectedResult: text('expectedResult').notNull(),
    priority: text('priority').notNull(),
    moduleId: text('moduleId').notNull().references(() => modules.id, { onDelete: 'cascade' }),
});

export const testRuns = sqliteTable('TestRun', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
});

export const testResults = sqliteTable('TestResult', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    status: text('status').notNull().default('UNTESTED'),
    notes: text('notes'),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    testRunId: text('testRunId').notNull().references(() => testRuns.id, { onDelete: 'cascade' }),
    testCaseId: text('testCaseId').notNull().references(() => testCases.id, { onDelete: 'cascade' }),
}, (table) => ({
    uniq_run_case: uniqueIndex('uniq_run_case').on(table.testRunId, table.testCaseId),
}));

export const testAttachments = sqliteTable('TestAttachment', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    filePath: text('filePath').notNull(),
    fileType: text('fileType').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    testResultId: text('testResultId').notNull().references(() => testResults.id, { onDelete: 'cascade' }),
});
