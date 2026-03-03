import { DashboardRepository } from '../repositories/dashboard.repository';
import { TestCaseRepository } from '@/domains/test-design/repositories/test-case.repository';
import { TestRunRepository } from '@/domains/test-execution/repositories/test-run.repository';

export class DashboardService {
  private dashboardRepo = new DashboardRepository();
  private testCaseRepo = new TestCaseRepository();
  private testRunRepo = new TestRunRepository();

  async getDashboardStats() {
    const totalCases = await this.testCaseRepo.count();
    const totalRuns = await this.testRunRepo.count();
    const latestRun = await this.dashboardRepo.getLatestRun();

    let statusData = [
      { name: 'Passed', value: 0, fill: '#22c55e' },
      { name: 'Failed', value: 0, fill: '#ef4444' },
      { name: 'Blocked', value: 0, fill: '#f97316' },
      { name: 'Untested', value: 0, fill: '#94a3b8' },
    ];

    let moduleData: any[] = [];

    if (latestRun) {
      const counts = { PASSED: 0, FAILED: 0, BLOCKED: 0, UNTESTED: 0 };
      const moduleStats: Record<string, { passed: number, total: number }> = {};

      latestRun.testResults.forEach(result => {
        counts[result.status as keyof typeof counts]++;
        
        const modName = result.testCase.module.name;
        if (!moduleStats[modName]) {
          moduleStats[modName] = { passed: 0, total: 0 };
        }
        moduleStats[modName].total++;
        if (result.status === 'PASSED') {
          moduleStats[modName].passed++;
        }
      });

      statusData[0].value = counts.PASSED;
      statusData[1].value = counts.FAILED;
      statusData[2].value = counts.BLOCKED;
      statusData[3].value = counts.UNTESTED;

      moduleData = Object.keys(moduleStats).map(mod => ({
        name: mod.length > 15 ? mod.substring(0, 15) + '...' : mod,
        successRate: Math.round((moduleStats[mod].passed / moduleStats[mod].total) * 100)
      }));
    }

    return {
      totalCases,
      totalRuns,
      latestRun,
      statusData,
      moduleData,
    };
  }
}
