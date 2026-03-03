import { DashboardService } from '@/domains/reporting/services/dashboard.service';
import { DashboardCharts } from '@/components/DashboardCharts';
import { ImportButton } from '@/components/ImportButton';
import Link from 'next/link';

export default async function DashboardPage() {
  const dashboardService = new DashboardService();
  const { totalCases, totalRuns, latestRun, statusData, moduleData } = await dashboardService.getDashboardStats();

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
