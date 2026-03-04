'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, FolderUp, Loader2 } from 'lucide-react';
import { Modal } from '@/ui/shared/Modal';
import { useTestRunStore } from '@/infrastructure/state/store';

export function AIGenerateButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [contextPrompt, setContextPrompt] = useState('');
    const [files, setFiles] = useState<{ path: string; content: string }[]>([]);
    const activeProjectId = useTestRunStore((state) => state.activeProjectId);
    const router = useRouter();

    // Handle folder selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const fileList = Array.from(e.target.files);
        // Extensions that the LLM should read
        const validExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.go', '.java', '.md', '.txt', '.json'];

        // Filter out node_modules, build folders, non-code files
        const codeFiles = fileList.filter(f => {
            const path = f.webkitRelativePath || f.name;
            if (path.includes('node_modules/') || path.includes('.git/') || path.includes('dist/') || path.includes('build/') || path.includes('.next/')) return false;
            return validExtensions.some(ext => path.endsWith(ext));
        });

        // We limit to 50 files for the prompt context limit
        const filesToRead = codeFiles.slice(0, 50);

        const readFiles = await Promise.all(
            filesToRead.map(async (file) => {
                const text = await file.text();
                return { path: file.webkitRelativePath || file.name, content: text };
            })
        );

        setFiles(readFiles);
    };

    const handleGenerate = async () => {
        if (files.length === 0 || !activeProjectId) {
            alert('Please select a project from the project switcher before generating.');
            return;
        }
        setIsGenerating(true);

        try {
            const res = await fetch('/api/ai/generate-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files,
                    contextPrompt,
                    projectId: activeProjectId,
                    saveImmediately: true
                })
            });

            const data = await res.json();

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                alert(data.error || 'Failed to generate test plan. Make sure your LLM provider is running and configured correctly in Settings.');
            }
        } catch (e) {
            console.error(e);
            alert('Error connecting to the AI provider. Check your settings.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium transition-colors"
            >
                <Sparkles className="h-4 w-4" />
                AI Generate Plan
            </button>

            <Modal isOpen={isOpen} onClose={() => !isGenerating && setIsOpen(false)} title="AI Test Plan Generation">
                <div className="space-y-6">
                    <p className="text-sm text-slate-500">
                        Select a project folder. The AI will read your source code and automatically generate a comprehensive test plan with modules and test cases.
                    </p>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Context / Requirements (Optional)</label>
                        <textarea
                            className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g., Focus on edge cases for the authentication flow..."
                            value={contextPrompt}
                            onChange={(e) => setContextPrompt(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Source Code Folder</label>
                        <div className={`mt-1 flex justify-center rounded-lg border border-dashed px-6 py-10 ${files.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-gray-900/25'}`}>
                            <div className="text-center">
                                <FolderUp className={`mx-auto h-12 w-12 ${files.length > 0 ? 'text-primary' : 'text-gray-300'}`} aria-hidden="true" />
                                <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                    <label
                                        htmlFor="folder-upload"
                                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                                    >
                                        <span>Choose a directory</span>
                                        <input
                                            id="folder-upload"
                                            name="folder-upload"
                                            type="file"
                                            // @ts-ignore - webkitdirectory is non-standard but widely supported
                                            webkitdirectory="true"
                                            directory="true"
                                            multiple
                                            className="sr-only"
                                            onChange={handleFileChange}
                                            disabled={isGenerating}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs leading-5 text-gray-600 mt-2">
                                    {files.length > 0 ? <strong className="text-primary">{files.length} valid code files loaded.</strong> : 'Select project root folder'}
                                </p>
                                {files.length === 50 && (
                                    <p className="text-xs text-orange-500 mt-1">Limited to 50 files to prevent exceeding context limits.</p>
                                )}
                            </div>
                        </div>
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
                            disabled={files.length === 0 || isGenerating}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isGenerating ? 'Analyzing Code...' : 'Generate Test Plan'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
