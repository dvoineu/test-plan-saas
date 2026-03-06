import { XCircle, Paperclip, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TestStatus } from '@/domain/types';
import { STATUS_CONFIG } from './TestResultRow';

interface TestResultDetailProps {
    selectedResult: any;
    onClose: () => void;
    updateStatus: (id: string, status: TestStatus) => void;
    updateNotes: (id: string, notes: string) => Promise<void>;
    deleteAttachment: (id: string) => Promise<void>;
    dropzoneProps: {
        getRootProps: any;
        getInputProps: any;
        isDragActive: boolean;
    };
}

export function TestResultDetail({
    selectedResult,
    onClose,
    updateStatus,
    updateNotes,
    deleteAttachment,
    dropzoneProps: { getRootProps, getInputProps, isDragActive }
}: TestResultDetailProps) {
    if (!selectedResult) return null;

    return (
        <div className="w-[450px] border-l bg-card p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-bold text-muted-foreground">{selectedResult.testCase.testId}</span>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <XCircle className="h-5 w-5" />
                </button>
            </div>

            <h2 className="text-xl font-bold mb-6">{selectedResult.testCase.title}</h2>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['PASSED', 'FAILED', 'BLOCKED', 'UNTESTED'] as TestStatus[]).map((s) => {
                            const Config = STATUS_CONFIG[s];
                            const Icon = Config.icon;
                            const isActive = selectedResult.status === s;
                            return (
                                <button
                                    key={s}
                                    onClick={() => updateStatus(selectedResult.id, s)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                                        isActive ? cn(Config.bg, Config.color, "border-current") : "hover:bg-muted"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {Config.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Steps</label>
                    <div className="rounded-lg bg-muted/30 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedResult.testCase.steps}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Expected Result</label>
                    <div className="rounded-lg bg-muted/30 p-4 text-sm whitespace-pre-wrap leading-relaxed border-l-4 border-primary">
                        {selectedResult.testCase.expectedResult}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Notes</label>
                    <textarea
                        className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                        placeholder="Add notes, error logs, or observations..."
                        defaultValue={selectedResult.notes || ''}
                        onBlur={(e) => updateNotes(selectedResult.id, e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Attachments</label>
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
                        )}
                    >
                        <input {...getInputProps()} />
                        <Paperclip className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Drag & drop or click to upload screenshots/videos</p>
                    </div>

                    {selectedResult.attachments?.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            {selectedResult.attachments.map((a: any) => (
                                <div key={a.id} className="group relative rounded-lg border bg-muted/30 overflow-hidden">
                                    {a.fileType.startsWith('image/') ? (
                                        <div className="aspect-video relative bg-black/5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={a.filePath}
                                                alt="Attachment"
                                                className="object-contain w-full h-full"
                                            />
                                        </div>
                                    ) : a.fileType.startsWith('video/') ? (
                                        <div className="aspect-video relative bg-black">
                                            <video
                                                src={a.filePath}
                                                controls
                                                className="w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video flex items-center justify-center bg-muted">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}

                                    <div className="p-2 flex items-center justify-between gap-2 text-xs border-t bg-background/50 backdrop-blur-sm">
                                        <a href={a.filePath} target="_blank" rel="noopener noreferrer" className="truncate hover:underline font-medium block flex-1 text-muted-foreground hover:text-foreground">
                                            {a.filePath.split('-').slice(1).join('-')}
                                        </a>
                                        <button
                                            onClick={() => deleteAttachment(a.id)}
                                            className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors"
                                            title="Delete attachment"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
