'use client';

import { create } from 'zustand';
import type { TestStatus } from '@/domain/types';

interface TestRunState {
    activeProjectId: string | null;
    setActiveProjectId: (id: string | null) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: TestStatus | 'ALL';
    setStatusFilter: (status: TestStatus | 'ALL') => void;
    priorityFilter: string;
    setPriorityFilter: (priority: string) => void;
    selectedResultId: string | null;
    setSelectedResultId: (id: string | null) => void;
    selectedResultIds: Set<string>;
    setSelectedResultIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    clearSelection: () => void;
    selectedIndex: number;
    setSelectedIndex: (index: number | ((prev: number) => number)) => void;
}

export const useTestRunStore = create<TestRunState>((set) => ({
    activeProjectId: null,
    setActiveProjectId: (id) => set({ activeProjectId: id }),

    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    statusFilter: 'ALL',
    setStatusFilter: (status) => set({ statusFilter: status }),

    priorityFilter: 'ALL',
    setPriorityFilter: (priority) => set({ priorityFilter: priority }),

    selectedResultId: null,
    setSelectedResultId: (id) => set({ selectedResultId: id }),

    selectedResultIds: new Set(),
    setSelectedResultIds: (updater) => set((state) => ({
        selectedResultIds: typeof updater === 'function' ? updater(state.selectedResultIds) : updater
    })),
    clearSelection: () => set({ selectedResultIds: new Set() }),

    selectedIndex: 0,
    setSelectedIndex: (updater) => set((state) => ({
        selectedIndex: typeof updater === 'function' ? updater(state.selectedIndex) : updater
    })),
}));
