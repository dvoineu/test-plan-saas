'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, ChevronRight, Edit2, Check, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useProjectStore } from '@/infrastructure/state/useProjectStore';

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingRunId, setEditingRunId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const activeProjectId = useProjectStore((state) => state.activeProjectId);

  useEffect(() => {
    if (activeProjectId) {
      fetchRuns();
    } else {
      setRuns([]);
    }
  }, [activeProjectId]);

  const fetchRuns = async () => {
    if (!activeProjectId) return;
    const res = await fetch(`/api/runs?projectId=${activeProjectId}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setRuns(data);
    }
  };

  const createRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !activeProjectId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, projectId: activeProjectId }),
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

  const renameRun = async (runId: string) => {
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setEditingRunId(null);
        fetchRuns();
      }
    } catch (error) {
      console.error('Failed to rename run:', error);
    }
  };

  const handleDeleteRun = async (e: React.MouseEvent, runId: string, runName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${runName}"? This action is irreversible.`)) return;

    try {
      const res = await fetch(`/api/runs/${runId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchRuns();
      }
    } catch (error) {
      console.error('Failed to delete run:', error);
    }
  };

  const handleEditRun = (e: React.MouseEvent, runId: string, runName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingRunId(runId);
    setEditName(runName);
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
          disabled={loading || !newName.trim() || !activeProjectId}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Create Run
        </button>
      </form>

      <div className="grid gap-4">
        {!activeProjectId ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
            Please select a project to view and create test runs.
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
            No test runs yet. Create one above to start testing.
          </div>
        ) : (
          runs.map((run) => (
            <div key={run.id} className="relative group flex items-center justify-between p-6 rounded-xl border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              {/* Clickable area for navigation */}
              <Link
                href={`/runs/${run.id}`}
                className="absolute inset-0 z-0 rounded-xl"
                aria-label={`Open ${run.name}`}
              />

              <div className="space-y-1 flex-1 relative z-10 pointer-events-none">
                {editingRunId === run.id ? (
                  <div className="flex items-center gap-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-transparent border-b border-primary text-xl font-semibold outline-none w-full"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameRun(run.id);
                        if (e.key === 'Escape') setEditingRunId(null);
                      }}
                    />
                  </div>
                ) : (
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {run.name}
                  </h3>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(run.createdAt), 'PPP')}
                  </div>
                  <div>{run._count?.testResults || 0} Test Cases</div>
                </div>
              </div>

              {/* Action buttons - above the link layer */}
              <div className="relative z-10 flex items-center gap-2">
                {editingRunId === run.id ? (
                  <>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); renameRun(run.id); }}
                      className="p-2 hover:bg-accent rounded-lg text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingRunId(null); }}
                      className="p-2 hover:bg-accent rounded-lg text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => handleEditRun(e, run.id, run.name)}
                      className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent rounded-lg text-muted-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteRun(e, run.id, run.name)}
                      className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent rounded-lg text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
