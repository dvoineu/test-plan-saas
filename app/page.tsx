'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardCharts } from '@/ui/dashboard/DashboardCharts';
import { ImportButton } from '@/ui/test-design/ImportButton';
import { AIGenerateButton } from '@/ui/test-design/AIGenerateButton';
import { useProjectStore } from '@/infrastructure/state/useProjectStore';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Minus,
  TestTubes, Play, CheckCircle2, Clock,
  Activity, RefreshCw, Plus, Download,
  ChevronRight, AlertTriangle, Zap, Target,
  ArrowRight, Check,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────
interface DashboardData {
  totalCases: number;
  totalRuns: number;
  latestRun: any;
  statusData: Array<{ name: string; value: number; fill: string }>;
  moduleData: any[];
  history: Array<{ date: string; passRate: number }>;
  flakyTests: Array<{ testId: string; title: string; failureRate: number }>;
  passRate: number;
  lastRunDate: string | null;
  casesDelta: number;
  runsDelta: number;
  passRateDelta: number;
  priorityDistribution: Array<{ priority: string; count: number; fill: string }>;
  recentRuns: Array<{
    id: string; name: string; createdAt: string;
    total: number; passed: number; failed: number; blocked: number; untested: number; passRate: number;
  }>;
  activities: Array<{
    id: string; type: string; message: string; timestamp: string;
    meta?: Record<string, unknown>;
  }>;
  coverageByModule: Array<{
    id: string; name: string; totalCases: number; testedCases: number; passRate: number;
  }>;
  healthScore: number;
}

// ─── Helper Components ──────────────────────────────────────

function DeltaBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> 0{suffix}
    </span>
  );
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? '+' : ''}{value}{suffix}
    </span>
  );
}

function HealthGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#f97316';
    if (s >= 40) return '#eab308';
    return '#ef4444';
  };
  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
          <circle
            cx="60" cy="60" r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color }}>{getLabel(score)}</span>
    </div>
  );
}

function ProgressBar({ value, color = '#3b82f6', height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: 'hsl(var(--muted))' }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatusDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    run_created: 'bg-blue-500',
    run_completed: 'bg-emerald-500',
    cases_imported: 'bg-purple-500',
    result_updated: 'bg-yellow-500',
  };
  return <div className={`h-2 w-2 rounded-full ${colors[type] || 'bg-gray-400'} shrink-0`} />;
}

// ─── Onboarding Wizard ──────────────────────────────────────

function OnboardingWizard({ totalCases, totalRuns }: { totalCases: number; totalRuns: number }) {
  const steps = [
    { label: 'Create a project', done: true },
    { label: 'Import test cases', done: totalCases > 0, count: totalCases },
    { label: 'Create first test run', done: totalRuns > 0 },
    { label: 'Execute test cases', done: false },
    { label: 'Review results', done: false },
  ];

  const currentStep = steps.findIndex(s => !s.done);
  const progress = Math.round((steps.filter(s => s.done).length / steps.length) * 100);

  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-8 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Getting Started</h3>
        <p className="text-sm text-muted-foreground">
          Complete these steps to unlock the full dashboard experience
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} color="#8b5cf6" height={8} />
      </div>

      <div className="flex flex-col gap-3 max-w-lg mx-auto">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${step.done
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : i === currentStep
                ? 'bg-primary/10 text-primary font-medium ring-1 ring-primary/30'
                : 'bg-muted/30 text-muted-foreground'
              }`}
          >
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.done
              ? 'bg-emerald-500 text-white'
              : i === currentStep
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
              }`}>
              {step.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span>{step.label}</span>
            {step.count !== undefined && step.done && (
              <span className="ml-auto text-xs opacity-70">({step.count})</span>
            )}
            {i === currentStep && !step.done && (
              <ArrowRight className="ml-auto h-4 w-4 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 pt-2">
        {totalCases === 0 ? (
          <>
            <AIGenerateButton />
            <ImportButton />
          </>
        ) : totalRuns === 0 ? (
          <Link
            href="/runs"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Create Test Run
          </Link>
        ) : (
          <Link
            href="/runs"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Test Runs <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ────────────────────────────────────

const DATE_RANGES = [
  { label: '7d', value: 7 },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
] as const;

const AUTO_REFRESH_INTERVAL = 30_000; // 30 seconds

export default function DashboardPage() {
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isManual = false) => {
    if (!activeProjectId) return;
    if (isManual) setRefreshing(true);

    try {
      const res = await fetch(`/api/dashboard?projectId=${activeProjectId}&days=${days}`);
      const data = await res.json();
      setStats(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeProjectId, days]);

  // Initial load + date range changes
  useEffect(() => {
    if (activeProjectId) {
      setLoading(true);
      fetchStats();
    } else {
      setStats(null);
      setLoading(false);
    }
  }, [activeProjectId, days, fetchStats]);

  // Auto-refresh
  useEffect(() => {
    if (!activeProjectId) return;
    const timer = setInterval(() => fetchStats(), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [activeProjectId, fetchStats]);

  // ─── Empty states ─────────────────────
  if (!activeProjectId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto opacity-30" />
          <p>Please select or create a project from the sidebar to view the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin opacity-50" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const {
    totalCases = 0, totalRuns = 0, latestRun = null, statusData = [], moduleData = [],
    history = [], flakyTests = [], passRate = 0, lastRunDate = null,
    casesDelta = 0, runsDelta = 0, passRateDelta = 0,
    priorityDistribution = [], recentRuns = [], activities = [],
    coverageByModule = [], healthScore = 0,
  } = stats;

  const hasRuns = totalRuns > 0 && latestRun;

  return (
    <div className="p-6 lg:p-8 space-y-6 overflow-y-auto h-full">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range filter */}
          <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
            {DATE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setDays(range.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${days === range.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Quick actions */}
          <Link
            href="/runs"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Play className="h-3.5 w-3.5" /> Test Runs
          </Link>
          <AIGenerateButton />
          <ImportButton />
        </div>
      </div>

      {/* ─── KPI Cards (4 columns) ──────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/runs" className="group">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 transition-all hover:shadow-md hover:border-primary/40 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-muted-foreground">Total Test Cases</div>
              <TestTubes className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="text-3xl font-bold tracking-tight">{totalCases.toLocaleString()}</div>
            <div className="mt-1">
              <DeltaBadge value={casesDelta} suffix=" this week" />
            </div>
          </div>
        </Link>

        <Link href="/runs" className="group">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 transition-all hover:shadow-md hover:border-primary/40 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-muted-foreground">Total Test Runs</div>
              <Play className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="text-3xl font-bold tracking-tight">{totalRuns.toLocaleString()}</div>
            <div className="mt-1">
              <DeltaBadge value={runsDelta} suffix=" this week" />
            </div>
          </div>
        </Link>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-muted-foreground">Overall Pass Rate</div>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <div className="text-3xl font-bold tracking-tight">
            {hasRuns ? `${passRate}%` : '—'}
          </div>
          <div className="mt-1">
            {hasRuns ? <DeltaBadge value={passRateDelta} suffix="% vs prev" /> : (
              <span className="text-xs text-muted-foreground">No runs yet</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-muted-foreground">Last Run</div>
            <Clock className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <div className="text-3xl font-bold tracking-tight">
            {lastRunDate ? formatDistanceToNow(new Date(lastRunDate), { addSuffix: true }) : '—'}
          </div>
          <div className="mt-1">
            {latestRun ? (
              <span className="text-xs text-muted-foreground">{latestRun.name}</span>
            ) : (
              <span className="text-xs text-muted-foreground">No runs yet</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── If no runs, show onboarding wizard ────────── */}
      {!hasRuns ? (
        <OnboardingWizard totalCases={totalCases} totalRuns={totalRuns} />
      ) : (
        <>
          {/* ─── Charts Row 1: Status + Historical ──────── */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Status Distribution</h3>
                <span className="text-xs text-muted-foreground">{latestRun.name}</span>
              </div>
              <DashboardCharts type="pie" data={statusData} />
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Pass Rate History</h3>
                <span className="text-xs text-muted-foreground">Last {days} days</span>
              </div>
              {history.length > 0 ? (
                <DashboardCharts type="area" data={history} />
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  Not enough historical data yet
                </div>
              )}
            </div>
          </div>

          {/* ─── Charts Row 2: Modules + Priority ───────── */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="font-semibold mb-4">Success Rate by Module</h3>
              {moduleData.length > 0 ? (
                <DashboardCharts type="bar" data={moduleData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  No module data available
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="font-semibold mb-4">Test Cases by Priority</h3>
              {priorityDistribution.length > 0 ? (
                <DashboardCharts type="priority" data={priorityDistribution} />
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  No priority data available
                </div>
              )}
            </div>
          </div>

          {/* ─── Health Score + Coverage Heatmap ─────────── */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Health Score */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center justify-center">
              <h3 className="font-semibold mb-4">Test Health Score</h3>
              <HealthGauge score={healthScore} />
              <p className="text-xs text-muted-foreground mt-3 text-center max-w-[200px]">
                Based on pass rate, flaky tests, freshness, and coverage
              </p>
            </div>

            {/* Coverage Heatmap */}
            <div className="md:col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="font-semibold mb-4">Module Coverage</h3>
              {coverageByModule.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {coverageByModule.map((mod) => {
                    const color = mod.passRate >= 80 ? '#22c55e' : mod.passRate >= 50 ? '#f97316' : '#ef4444';
                    return (
                      <div
                        key={mod.id}
                        className="rounded-lg border p-3 transition-all hover:shadow-sm"
                        style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
                      >
                        <div className="text-sm font-medium truncate" title={mod.name}>{mod.name}</div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-lg font-bold" style={{ color }}>{mod.passRate}%</span>
                          <span className="text-xs text-muted-foreground">{mod.totalCases} cases</span>
                        </div>
                        <ProgressBar value={mod.passRate} color={color} height={4} />
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {mod.testedCases}/{mod.totalCases} tested
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                  No modules found
                </div>
              )}
            </div>
          </div>

          {/* ─── Recent Runs + Flaky Tests ───────────────── */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Runs */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Test Runs</h3>
                <Link href="/runs" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              {recentRuns.length > 0 ? (
                <div className="space-y-3">
                  {recentRuns.map((run) => {
                    const color = run.passRate >= 80 ? '#22c55e' : run.passRate >= 50 ? '#f97316' : '#ef4444';
                    return (
                      <Link key={run.id} href={`/runs/${run.id}`} className="block">
                        <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors -mx-1">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{run.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                              {' · '}{run.total} tests
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold" style={{ color }}>{run.passRate}%</span>
                            <div className="w-20">
                              <ProgressBar value={run.passRate} color={color} height={4} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No recent runs
                </div>
              )}
            </div>

            {/* Flaky Tests */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold">Flaky Tests</h3>
              </div>
              {flakyTests.length > 0 ? (
                <div className="space-y-3">
                  {flakyTests.map((test) => (
                    <div key={test.testId} className="flex items-center gap-3 rounded-lg p-3 -mx-1 hover:bg-accent/30 transition-colors">
                      <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{test.title}</div>
                        <div className="text-xs text-muted-foreground">{test.testId}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{test.failureRate}%</span>
                        <div className="w-16">
                          <ProgressBar value={test.failureRate} color="#f59e0b" height={4} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8 space-y-1">
                  <CheckCircle2 className="h-6 w-6 mx-auto opacity-40" />
                  <p>No flaky tests detected</p>
                  <p className="text-xs">Run more tests to build statistical data</p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Activity Feed ──────────────────────────── */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            {activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 py-2">
                    <div className="mt-1.5">
                      <StatusDot type={activity.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{activity.message}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
