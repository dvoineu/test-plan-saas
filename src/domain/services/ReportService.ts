import type { ITestRunRepository } from '../ports/repositories/ITestRunRepository';
import type { TestRunWithResults, RunStats } from '../types';

/**
 * Service: Report
 * Generates HTML/Markdown reports from test run results.
 * Extracted from the old inline HTML generation in export/route.ts.
 */
export class ReportService {
  constructor(
    private readonly testRunRepo: ITestRunRepository,
  ) { }

  async generateHTMLReport(runId: string): Promise<string> {
    const run = await this.testRunRepo.findById(runId);
    if (!run) {
      throw new Error(`Test run not found: ${runId}`);
    }

    const stats = this.calculateStats(run);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Report: ${this.escapeHtml(run.name)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #333; max-width: 1200px; margin: 0 auto; }
    h1 { color: #111; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
    .meta { color: #6b7280; margin-bottom: 24px; }
    .stats { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
    .stat { padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; }
    .passed { background: #dcfce7; color: #166534; }
    .failed { background: #fee2e2; color: #991b1b; }
    .blocked { background: #ffedd5; color: #9a3412; }
    .untested { background: #f1f5f9; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    th { background: #f9fafb; font-weight: 600; }
    tr:hover { background: #f9fafb; }
    .status-passed { color: #166534; font-weight: 600; }
    .status-failed { color: #991b1b; font-weight: 600; }
    .status-blocked { color: #9a3412; font-weight: 600; }
    .status-untested { color: #6b7280; }
    .notes { color: #6b7280; font-style: italic; max-width: 300px; }
  </style>
</head>
<body>
  <h1>Test Report: ${this.escapeHtml(run.name)}</h1>
  <p class="meta">Generated on: ${new Date().toLocaleString()}</p>

  <div class="stats">
    <div class="stat passed">✓ Passed: ${stats.passed}</div>
    <div class="stat failed">✗ Failed: ${stats.failed}</div>
    <div class="stat blocked">⊘ Blocked: ${stats.blocked}</div>
    <div class="stat untested">○ Untested: ${stats.untested}</div>
    <div class="stat">Total: ${stats.total}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Module</th>
        <th>Title</th>
        <th>Status</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${run.testResults.map((r: TestRunWithResults['testResults'][number]) => `
      <tr>
        <td>${this.escapeHtml(r.testCase.testId)}</td>
        <td>${this.escapeHtml(r.testCase.module.name)}</td>
        <td>${this.escapeHtml(r.testCase.title)}</td>
        <td class="status-${r.status.toLowerCase()}">${r.status}</td>
        <td class="notes">${this.escapeHtml(r.notes || '')}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;
  }

  private calculateStats(run: TestRunWithResults): RunStats {
    const stats: RunStats = { passed: 0, failed: 0, blocked: 0, untested: 0, total: run.testResults.length };

    run.testResults.forEach((r) => {
      switch (r.status) {
        case 'PASSED': stats.passed++; break;
        case 'FAILED': stats.failed++; break;
        case 'BLOCKED': stats.blocked++; break;
        case 'UNTESTED': stats.untested++; break;
      }
    });

    return stats;
  }

  /** Prevent XSS in generated HTML */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
