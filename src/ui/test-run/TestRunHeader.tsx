import { ArrowLeft, Download, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AIBugReportButton } from './AIBugReportButton';

interface TestRunHeaderProps {
    run: any;
    stats: {
        PASSED: number;
        FAILED: number;
        BLOCKED: number;
        UNTESTED: number;
        total: number;
    };
}

export function TestRunHeader({ run, stats }: TestRunHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(run.name);
    const [isSaving, setIsSaving] = useState(false);

    const getPercent = (val: number) => (val / (stats.total || 1)) * 100 || 0;

    const handleSave = async () => {
        if (!name.trim() || name === run.name) {
            setIsEditing(false);
            setName(run.name);
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/runs/${run.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                run.name = name; // Optimistic update
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to rename run:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                    <Link href="/runs" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 bg-transparent border-b border-primary text-2xl font-bold outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') {
                                        setIsEditing(false);
                                        setName(run.name);
                                    }
                                }}
                                disabled={isSaving}
                            />
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="p-1 hover:bg-accent rounded text-green-600"
                            >
                                <Check className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(run.name);
                                }}
                                disabled={isSaving}
                                className="p-1 hover:bg-accent rounded text-red-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-2xl font-bold">{run.name}</h1>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent rounded text-muted-foreground"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={async () => {
                            if (!confirm('Are you sure you want to finish this run? This will trigger Slack notifications if configured.')) return;
                            await fetch(`/api/runs/${run.id}/finish`, { method: 'POST' });
                            alert('Run Finished! Notifications sent.');
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-50 text-green-700 px-3 py-1.5 text-sm font-medium hover:bg-green-100"
                    >
                        Finish Run
                    </button>
                    <AIBugReportButton runId={run.id} />
                    <button
                        onClick={() => window.open(`/api/runs/${run.id}/export`, '_blank')}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent"
                    >
                        <Download className="h-4 w-4" />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="bg-green-500 transition-all" style={{ width: `${getPercent(stats.PASSED)}%` }} />
                <div className="bg-red-500 transition-all" style={{ width: `${getPercent(stats.FAILED)}%` }} />
                <div className="bg-orange-500 transition-all" style={{ width: `${getPercent(stats.BLOCKED)}%` }} />
            </div>
            <div className="mt-2 flex gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> {stats.PASSED} Passed</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> {stats.FAILED} Failed</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> {stats.BLOCKED} Blocked</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" /> {stats.UNTESTED} Untested</span>
            </div>
        </header>
    );
}
