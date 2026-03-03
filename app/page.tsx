import { prisma } from '@/lib/prisma';
import { DashboardCharts } from '@/components/DashboardCharts';
import { ImportButton } from '@/components/ImportButton';
import Link from 'next/link';

export default async function DashboardPage() {
  // Fetch stats
  const totalCases = await prisma.testCase.count();
  const totalRuns = await prisma.testRun.count();
  
  // For charts, we need the latest test run results or overall results.
  // Let's get the latest test run
  const latestRun = await prisma.testRun.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      testResults: {
        include: {
          testCase: {
            include: { module: true }
          }
        }
      }
    }
  });

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

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/runs" className="text-sm font-medium text-muted-foreground hover:text-primary underline">
            Go to Runs
          </Link>
          <ImportButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground">Total Test Cases</div>
          <div className="text-2xl font-bold">{totalCases}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground">Total Test Runs</div>
          <div className="text-2xl font-bold">{totalRuns}</div>
        </div>
      </div>

      {latestRun ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4">Latest Run Status ({latestRun.name})</h3>
            <DashboardCharts type="pie" data={statusData} />
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4">Success Rate by Module</h3>
            <DashboardCharts type="bar" data={moduleData} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4">
          <div className="text-muted-foreground">
            {totalCases > 0 
              ? "You have imported test cases. Now create a test run to start testing."
              : "No test cases found. Import a test plan (Markdown) to get started."}
          </div>
          {totalCases > 0 && (
            <Link 
              href="/runs" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Go to Test Runs
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
