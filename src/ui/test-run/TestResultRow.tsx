import { ChevronRight, CheckCircle2, XCircle, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TestStatus } from '@/domain/types';

export const STATUS_CONFIG = {
    PASSED: { color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2, label: 'Passed' },
    FAILED: { color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'Failed' },
    BLOCKED: { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: AlertCircle, label: 'Blocked' },
    UNTESTED: { color: 'text-slate-400', bg: 'bg-slate-400/10', icon: Circle, label: 'Untested' },
};

interface TestResultRowProps {
    result: any;
    isSelected: boolean;
    isChecked: boolean;
    onClick: () => void;
    onCheck: (checked: boolean) => void;
}

export function TestResultRow({ result, isSelected, isChecked, onClick, onCheck }: TestResultRowProps) {
    const StatusIcon = STATUS_CONFIG[result.status as TestStatus].icon;

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 px-4 py-3 cursor-pointer transition-all border-b last:border-0 border-l-4",
                isSelected
                    ? "bg-primary/10 border-l-primary"
                    : "border-l-transparent hover:bg-muted/50"
            )}
        >
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={isChecked}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onCheck(e.target.checked)}
            />
            <div className={cn("p-1 rounded-md", STATUS_CONFIG[result.status as TestStatus].bg)}>
                <StatusIcon className={cn("h-4 w-4", STATUS_CONFIG[result.status as TestStatus].color)} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-muted-foreground">{result.testCase.testId}</span>
                    <span className="text-sm font-medium truncate">{result.testCase.title}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                    result.testCase.priority === 'P1' ? "bg-red-500/10 text-red-500" :
                        result.testCase.priority === 'P2' ? "bg-orange-500/10 text-orange-500" :
                            "bg-blue-500/10 text-blue-500"
                )}>
                    {result.testCase.priority}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
        </div>
    );
}
