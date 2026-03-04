'use client';

import { create } from 'zustand';

interface ProjectState {
    activeProjectId: string | null;
    setActiveProjectId: (id: string | null) => void;
}

/**
 * Store: Active Project
 * Global application state for the currently selected project.
 * Separated from useTestRunStore to avoid mixing abstraction levels.
 */
export const useProjectStore = create<ProjectState>((set) => ({
    activeProjectId: null,
    setActiveProjectId: (id) => set({ activeProjectId: id }),
}));
