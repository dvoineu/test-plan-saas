'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    const res = await fetch('/api/runs');
    const data = await res.json();
    if (Array.isArray(data)) {
      setRuns(data);
    }
  };

  const createRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        setNewName('');
        fetchRuns();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Test Runs</h1>
      </div>

      <form onSubmit={createRun} className="flex gap-4 p-6 rounded-xl border bg-card shadow-sm">
        <input
          type="text"
          placeholder="New Run Name (e.g., Release 1.1)"
          className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium outline-none"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newName.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Create Run
        </button>
      </form>

      <div className="grid gap-4">
        {runs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
            No test runs yet. Create one above to start testing.
          </div>
        ) : (
          runs.map((run) => (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              className="flex items-center justify-between p-6 rounded-xl border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md group"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {run.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(run.createdAt), 'PPP')}
                  </div>
                  <div>{run._count.testResults} Test Cases</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
