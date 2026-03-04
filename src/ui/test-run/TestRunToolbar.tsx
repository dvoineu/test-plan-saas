import { Search, Filter } from 'lucide-react';
import type { TestStatus } from '@/domain/types';
import { useTestRunStore } from '@/infrastructure/state/store';

interface TestRunToolbarProps {
    massUpdateStatus: (status: TestStatus) => void;
}

export function TestRunToolbar({ massUpdateStatus }: TestRunToolbarProps) {
    const {
        searchQuery, setSearchQuery,
        statusFilter, setStatusFilter,
        priorityFilter, setPriorityFilter,
        selectedResultIds, clearSelection
    } = useTestRunStore();

    return (
        <div className="flex items-center gap-4 border-b bg-muted/10 px-6 py-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search test cases..."
                    className="w-full rounded-lg border bg-background pl-9 pr-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                    className="bg-transparent text-sm font-medium outline-none border-none p-1"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PASSED">Passed</option>
                    <option value="FAILED">Failed</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="UNTESTED">Untested</option>
                </select>
            </div>
            <div className="flex items-center gap-2 border-l pl-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                    className="bg-transparent text-sm font-medium outline-none border-none p-1"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                >
                    <option value="ALL">All Priorities</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                </select>
            </div>

            {selectedResultIds.size > 0 && (
                <div className="flex items-center gap-2 border-l pl-4 ml-auto">
                    <span className="text-xs font-bold text-muted-foreground">{selectedResultIds.size} selected</span>
                    <button onClick={() => massUpdateStatus('PASSED')} className="text-xs font-bold text-green-500 hover:underline">Pass</button>
                    <button onClick={() => massUpdateStatus('FAILED')} className="text-xs font-bold text-red-500 hover:underline">Fail</button>
                    <button onClick={() => massUpdateStatus('BLOCKED')} className="text-xs font-bold text-orange-500 hover:underline">Block</button>
                    <button onClick={clearSelection} className="text-xs font-bold text-muted-foreground hover:underline">Clear</button>
                </div>
            )}
        </div>
    );
}
