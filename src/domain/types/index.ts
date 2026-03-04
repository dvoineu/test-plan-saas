// ─── Value Types ─────────────────────────────────────────────

export type TestStatus = 'PASSED' | 'FAILED' | 'BLOCKED' | 'UNTESTED';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

// ─── Entity Types ────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface Module {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
}

export interface TestCase {
  id: string;
  testId: string;
  title: string;
  steps: string;
  expectedResult: string;
  priority: string;
  moduleId: string;
  module?: Module;
}

export interface TestRun {
  id: string;
  name: string;
  createdAt: Date;
  projectId: string;
  testResults?: TestResult[];
}

export interface TestResult {
  id: string;
  status: TestStatus;
  notes: string | null;
  testRunId: string;
  testCaseId: string;
  testCase?: TestCase;
  testRun?: TestRun;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filePath: string;
  fileType: string;
  createdAt: Date;
  testResultId: string;
}

// ─── DTO Types (Create / Update) ─────────────────────────────

export interface CreateProjectDTO {
  name: string;
  description?: string;
}

export interface CreateTestCaseDTO {
  testId: string;
  title: string;
  steps: string;
  expectedResult: string;
  priority: string;
  moduleId: string;
}

export interface UpdateResultDTO {
  status?: TestStatus;
  notes?: string;
}

export interface CreateAttachmentDTO {
  filePath: string;
  fileType: string;
  testResultId: string;
}

// ─── Aggregated Types (for views / dashboard) ────────────────

export interface RunStats {
  passed: number;
  failed: number;
  blocked: number;
  untested: number;
  total: number;
}

export interface ModuleStats {
  name: string;
  passed: number;
  total: number;
  successRate: number;
}

export interface HistoricalData {
  date: string;
  passRate: number;
}

export interface FlakyTest {
  testId: string;
  title: string;
  failureRate: number;
}

export interface DashboardData {
  totalCases: number;
  totalRuns: number;
  latestRun: TestRun | null;
  statusData: Array<{ name: string; value: number; fill: string }>;
  moduleData: ModuleStats[];
  history: HistoricalData[];
  flakyTests: FlakyTest[];
}

// ─── Test Run with full nested data ──────────────────────────

export interface TestRunWithResults extends TestRun {
  testResults: Array<TestResult & {
    testCase: TestCase & { module: Module };
    attachments: Attachment[];
  }>;
}

// ─── Module grouped results (for UI) ────────────────────────

export interface ModuleGroupedResults {
  id: string;
  name: string;
  results: Array<TestResult & {
    testCase: TestCase;
    attachments: Attachment[];
  }>;
}
