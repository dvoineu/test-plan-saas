'use client';

import { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '@/infrastructure/state/useProjectStore';
import {
    ChevronDown,
    Plus,
    Check,
    X,
    Edit2,
    Trash2,
    FolderGit2,
    FileText,
    AlertTriangle,
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string | null;
}

interface ProjectStats {
    modules: number;
    cases: number;
    runs: number;
}

export function ProjectSwitcher() {
    const { activeProjectId, setActiveProjectId } = useProjectStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
    const [deleteStats, setDeleteStats] = useState<ProjectStats | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [projectCaseCounts, setProjectCaseCounts] = useState<Record<string, number>>({});

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProjects = async () => {
        const res = await fetch('/api/projects');
        if (res.ok) {
            const data = await res.json();
            setProjects(data);
            if (!activeProjectId && data.length > 0) {
                setActiveProjectId(data[0].id);
            }
            // Fetch case counts for each project
            for (const p of data) {
                fetch(`/api/test-cases?projectId=${p.id}`)
                    .then(r => r.json())
                    .then(d => {
                        setProjectCaseCounts(prev => ({ ...prev, [p.id]: d.totalCases || 0 }));
                    })
                    .catch(() => { });
            }
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newProjectName, description: newProjectDesc || undefined }),
        });
        if (res.ok) {
            const newProject = await res.json();
            setProjects(prev => [...prev, newProject]);
            setActiveProjectId(newProject.id);
            setIsCreating(false);
            setNewProjectName('');
            setNewProjectDesc('');
            setIsOpen(false);
        }
    };

    const handleRenameProject = async (id: string) => {
        if (!editName.trim()) return;
        const res = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName, description: editDesc || undefined }),
        });
        if (res.ok) {
            const updated = await res.json();
            setProjects(prev => prev.map(p => (p.id === id ? updated : p)));
            setEditingId(null);
        }
    };

    const handleDeleteClick = async (project: Project) => {
        setDeleteTarget(project);
        setDeleteConfirmName('');
        // Fetch stats to show in confirmation
        try {
            const [modulesRes, casesRes, runsRes] = await Promise.all([
                fetch(`/api/test-cases?projectId=${project.id}`).then(r => r.json()),
                fetch(`/api/test-cases?projectId=${project.id}`).then(r => r.json()),
                fetch(`/api/runs?projectId=${project.id}`).then(r => r.json()),
            ]);
            setDeleteStats({
                modules: casesRes.modules?.length || 0,
                cases: casesRes.totalCases || 0,
                runs: Array.isArray(runsRes) ? runsRes.length : 0,
            });
        } catch {
            setDeleteStats({ modules: 0, cases: 0, runs: 0 });
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget || deleteConfirmName !== deleteTarget.name) return;
        const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' });
        if (res.ok) {
            setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
            if (activeProjectId === deleteTarget.id) {
                const remaining = projects.filter(p => p.id !== deleteTarget.id);
                setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
            }
            setDeleteTarget(null);
            setDeleteStats(null);
        }
    };

    const activeProject = projects.find(p => p.id === activeProjectId);

    return (
        <>
            <div className="p-4 border-b border-border" ref={dropdownRef}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Project
                </h3>

                {/* Custom dropdown trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between gap-2 bg-background border border-input rounded-md px-3 py-2 text-sm hover:border-primary/50 transition-colors text-left"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <FolderGit2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate font-medium">
                            {activeProject?.name || 'Select a Project'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {activeProject && projectCaseCounts[activeProject.id] !== undefined && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                {projectCaseCounts[activeProject.id]}
                            </span>
                        )}
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                    <div className="absolute left-4 right-4 mt-1 bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                        <div className="max-h-64 overflow-y-auto py-1">
                            {projects.map(p => (
                                <div key={p.id} className="group relative">
                                    {editingId === p.id ? (
                                        <div className="px-3 py-2 space-y-1.5">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleRenameProject(p.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                className="w-full rounded border border-input bg-transparent px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                                                autoFocus
                                                placeholder="Project name"
                                            />
                                            <input
                                                type="text"
                                                value={editDesc}
                                                onChange={e => setEditDesc(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleRenameProject(p.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                className="w-full rounded border border-input bg-transparent px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="Description (optional)"
                                            />
                                            <div className="flex gap-1 justify-end">
                                                <button onClick={() => handleRenameProject(p.id)} className="p-1 hover:bg-accent rounded text-green-600">
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1 hover:bg-accent rounded text-red-500">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setActiveProjectId(p.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors ${activeProjectId === p.id ? 'bg-accent/50' : ''
                                                }`}
                                        >
                                            <FolderGit2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{p.name}</div>
                                                {p.description && (
                                                    <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {/* Stats - visible by default, hidden on hover */}
                                                <span className="flex items-center gap-1 group-hover:hidden">
                                                    {projectCaseCounts[p.id] !== undefined && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {projectCaseCounts[p.id]} <FileText className="h-3 w-3 inline" />
                                                        </span>
                                                    )}
                                                    {activeProjectId === p.id && (
                                                        <Check className="h-4 w-4 text-primary ml-1" />
                                                    )}
                                                </span>

                                                {/* Actions - hidden by default, shown on hover */}
                                                <span className="hidden group-hover:flex items-center gap-0.5">
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setEditingId(p.id);
                                                            setEditName(p.name);
                                                            setEditDesc(p.description || '');
                                                        }}
                                                        className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                                                        title="Rename"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(p);
                                                        }}
                                                        className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-red-500"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Create new project */}
                        <div className="border-t border-border">
                            {isCreating ? (
                                <div className="p-3 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Project name..."
                                        value={newProjectName}
                                        onChange={e => setNewProjectName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                                        className="w-full rounded border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (optional)"
                                        value={newProjectDesc}
                                        onChange={e => setNewProjectDesc(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                                        className="w-full rounded border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCreateProject}
                                            className="flex-1 bg-primary text-primary-foreground text-xs rounded-md py-1.5 hover:bg-primary/90 font-medium"
                                        >
                                            Create
                                        </button>
                                        <button
                                            onClick={() => { setIsCreating(false); setNewProjectName(''); setNewProjectDesc(''); }}
                                            className="px-3 text-xs rounded-md py-1.5 border border-input hover:bg-accent"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Project
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {!activeProjectId && !isCreating && (
                    <p className="text-xs text-orange-500 mt-2">
                        Create or select a project to manage tests.
                    </p>
                )}
            </div>

            {/* Delete confirmation modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-popover border border-border rounded-xl p-6 w-96 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Delete Project</h3>
                                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 text-sm">
                            <p className="font-medium text-red-800 dark:text-red-300 mb-2">
                                Deleting &quot;{deleteTarget.name}&quot; will permanently remove:
                            </p>
                            {deleteStats && (
                                <ul className="space-y-1 text-red-700 dark:text-red-400">
                                    <li>• {deleteStats.modules} modules</li>
                                    <li>• {deleteStats.cases} test cases</li>
                                    <li>• {deleteStats.runs} test runs (with all results)</li>
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground block mb-1.5">
                                Type <span className="font-mono font-semibold text-foreground">{deleteTarget.name}</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmName}
                                onChange={e => setDeleteConfirmName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleDeleteConfirm()}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                placeholder={deleteTarget.name}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setDeleteTarget(null); setDeleteStats(null); }}
                                className="px-4 py-2 text-sm rounded-md border border-input hover:bg-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteConfirmName !== deleteTarget.name}
                                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                            >
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
