'use client';

import { useState, useEffect } from 'react';
import { DashboardCharts } from '@/ui/dashboard/DashboardCharts';
import { ImportButton } from '@/ui/test-design/ImportButton';
import { AIGenerateButton } from '@/ui/test-design/AIGenerateButton';
import Link from 'next/link';
// import { useTestRunStore } from '@/infrastructure/state/store';

export default function DashboardPage() {
  const activeProjectId = "dummy-project-id"; // useTestRunStore((state) => state.activeProjectId);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeProjectId) {
      setLoading(true);
      fetch(`/api/dashboard?projectId=${activeProjectId}`)
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch dashboard stats', err);
          setLoading(false);
        });
    } else {
      setStats(null);
      setLoading(false);
    }
  }, [activeProjectId]);

  if (!activeProjectId) {
    return (
      <div className="p-8 space-y-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 text-muted-foreground">
          <p>Please select or create a project from the sidebar to view the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="p-8 space-y-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 bg-primary/20 rounded-full"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const { totalCases, totalRuns, latestRun, statusData, moduleData } = stats;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/runs" className="text-sm font-medium text-muted-foreground hover:text-primary underline flex items-center pr-2">
            Go to Runs
          </Link>
          <AIGenerateButton />
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
