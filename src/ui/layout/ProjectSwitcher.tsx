'use client';

import { useState, useEffect } from 'react';
import { useTestRunStore } from '@/infrastructure/state/store';
import { FolderGit2, Plus, Check } from 'lucide-react';

interface Project {
    id: string;
    name: string;
}

export function ProjectSwitcher() {
    const { activeProjectId, setActiveProjectId } = useTestRunStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const res = await fetch('/api/projects');
        if (res.ok) {
            const data = await res.json();
            setProjects(data);

            // Auto-select first project if none is selected
            if (!activeProjectId && data.length > 0) {
                setActiveProjectId(data[0].id);
            }
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newProjectName })
        });

        if (res.ok) {
            const newProject = await res.json();
            setProjects([...projects, newProject]);
            setActiveProjectId(newProject.id);
            setIsCreating(false);
            setNewProjectName('');
        }
    };

    return (
        <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Project</h3>

            <div className="space-y-2">
                <select
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={activeProjectId || ''}
                    onChange={(e) => {
                        if (e.target.value === 'CREATE_NEW') {
                            setIsCreating(true);
                        } else {
                            setActiveProjectId(e.target.value);
                            setIsCreating(false);
                        }
                    }}
                >
                    <option value="" disabled>Select a Project</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    <option value="CREATE_NEW">+ Create New Project</option>
                </select>

                {isCreating && (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            placeholder="Project Name..."
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                            className="flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:ring-2 focus:ring-primary outline-none"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateProject}
                            className="bg-primary text-primary-foreground p-1 rounded hover:bg-primary/90"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {!activeProjectId && !isCreating && (
                <p className="text-xs text-orange-500 mt-2">
                    Create or select a project to manage tests.
                </p>
            )}
        </div>
    );
}
