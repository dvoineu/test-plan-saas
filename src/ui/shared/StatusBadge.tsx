import * as React from 'react';
import type { TestStatus } from '@/domain/types';
import { cn } from './lib/utils';

interface StatusBadgeProps {
    status: TestStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'px-2 py-1 text-xs font-semibold rounded-full border inline-flex items-center justify-center',
                {
                    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800': status === 'PASSED',
                    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800': status === 'FAILED',
                    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800': status === 'BLOCKED',
                    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700': status === 'UNTESTED',
                },
                className
            )}
        >
            {status}
        </span>
    );
}
