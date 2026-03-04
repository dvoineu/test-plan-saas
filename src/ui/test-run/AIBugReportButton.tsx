'use client';

import { useState } from 'react';
import { Bot, FileText, Loader2, Download } from 'lucide-react';
import { Modal } from '@/ui/shared/Modal';

interface Props {
    runId: string;
}

export function AIBugReportButton({ runId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [contextPrompt, setContextPrompt] = useState('');
    const [report, setReport] = useState<string | null>(null);
    const [isPushingToJira, setIsPushingToJira] = useState(false);
    const [jiraError, setJiraError] = useState('');
    const [jiraSuccess, setJiraSuccess] = useState('');

    const handleGenerate = async () => {
        setIsGenerating(true);
        setReport(null);
        try {
            const res = await fetch(`/api/runs/${runId}/bug-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contextPrompt })
            });
            const data = await res.json();
            if (res.ok) {
                setReport(data.report);
            } else {
                alert(data.error || 'Failed to generate bug report');
            }
        } catch (e) {
            console.error(e);
            alert('Error connecting to the AI provider');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!report) return;
        const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BugReport-Run-${runId}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePushToJira = async () => {
        if (!report) return;
        setIsPushingToJira(true);
        setJiraError('');
        setJiraSuccess('');

        try {
            const res = await fetch(`/api/integrations/jira/issue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `[QA Hub] Bug Report from Run ${runId}`,
                    descriptionMarkdown: report,
                    priority: 'P2' // Default priority
                })
            });
            const data = await res.json();
            if (res.ok) {
                setJiraSuccess(`Created successfully: ${data.issue.key}`);
            } else {
                setJiraError(data.error || 'Failed to push to Jira');
            }
        } catch (e) {
            console.error(e);
            setJiraError('Error connecting to Server');
        } finally {
            setIsPushingToJira(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent px-4 py-2 text-sm font-medium transition-colors"
            >
                <Bot className="h-4 w-4 text-purple-500" />
                AI Bug Report
            </button>

            <Modal isOpen={isOpen} onClose={() => !isGenerating && setIsOpen(false)} title="AI Developer Bug Report">
                <div className="space-y-6">
                    {!report ? (
                        <>
                            <p className="text-sm text-slate-500">
                                The AI will analyze all Failed and Blocked tests in this run, including tester notes and steps, to generate a comprehensive markdown bug report for developers.
                            </p>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Developer Focus / Context (Optional)</label>
                                <textarea
                                    className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="e.g., Focus specifically on the API 500 errors... Ignore UI quirks for now."
                                    value={contextPrompt}
                                    onChange={(e) => setContextPrompt(e.target.value)}
                                    disabled={isGenerating}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-slate-50 disabled:opacity-50"
                                    disabled={isGenerating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <SparklesIcon className="h-4 w-4" />}
                                    {isGenerating ? 'Analyzing Failures...' : 'Generate Report'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border bg-slate-50 p-4 max-h-[50vh] overflow-y-auto font-mono text-sm whitespace-pre-wrap dark:bg-slate-900">
                                {report}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setReport(null)}
                                    className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-slate-50"
                                >
                                    Regenerate
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border border-input bg-transparent hover:bg-slate-50 text-slate-700 rounded-md"
                                >
                                    <Download className="h-4 w-4" />
                                    Download .md
                                </button>
                                <div className="flex-1" />
                                {jiraError && <span className="text-sm text-red-500 my-auto">{jiraError}</span>}
                                {jiraSuccess ? (
                                    <span className="text-sm text-green-600 font-medium my-auto">{jiraSuccess}</span>
                                ) : (
                                    <button
                                        onClick={handlePushToJira}
                                        disabled={isPushingToJira}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isPushingToJira ? <Loader2 className="h-4 w-4 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M22.052 10.455L13.545 1.948A1.91 1.91 0 0010.84 4.653l8.507 8.507a1.91 1.91 0 002.705-2.705zM12.98 19.526a1.91 1.91 0 00-2.705 0L1.768 11.02a1.91 1.91 0 00-2.704 2.705l8.507 8.507a1.91 1.91 0 002.705-2.704zM10.84 19.526L2.333 11.019a1.91 1.91 0 00-2.705 2.706l8.508 8.507a1.91 1.91 0 002.705-2.706zM13.545 22.232a1.91 1.91 0 002.705 0l8.507-8.508a1.91 1.91 0 00-2.705-2.705l-8.507 8.507a1.91 1.91 0 000 2.706z" fill="#fff" /></svg>}
                                        {isPushingToJira ? 'Creating...' : 'Push to Jira'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}

function SparklesIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
            <path d="M20.5 3.5 19 6l-2.5 1.5L19 9l1.5 2.5L22 9l2.5-1.5L22 6Z" />
        </svg>
    );
}
