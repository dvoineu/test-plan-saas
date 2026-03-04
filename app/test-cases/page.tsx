'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Search, Filter, Plus, Edit2, Trash2, Download,
    ChevronDown, ChevronRight, FolderOpen, FileText,
    X, Check, AlertTriangle,
} from 'lucide-react';
import { useProjectStore } from '@/infrastructure/state/useProjectStore';

interface Module {
    id: string;
    name: string;
    description: string | null;
    projectId: string;
}

interface TestCase {
    id: string;
    testId: string;
    title: string;
    steps: string;
    expectedResult: string;
    priority: string;
    moduleId: string;
}

interface ModuleGroup {
    module: Module;
    testCases: TestCase[];
}

type ModalMode = 'create' | 'edit' | null;

const PRIORITY_COLORS: Record<string, string> = {
    P1: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    P2: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    P3: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    P4: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
};

export default function TestCasesPage() {
    const activeProjectId = useProjectStore(s => s.activeProjectId);
    const [data, setData] = useState<{ modules: ModuleGroup[]; totalCases: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('');
    const [filterModuleId, setFilterModuleId] = useState<string>('');
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    // Modal state
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editingCase, setEditingCase] = useState<TestCase | null>(null);
    const [form, setForm] = useState({
        testId: '', title: '', steps: '', expectedResult: '', priority: 'P2', moduleId: '',
    });

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<TestCase | null>(null);

    const fetchData = useCallback(async () => {
        if (!activeProjectId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/test-cases?projectId=${activeProjectId}`);
            if (res.ok) {
                const d = await res.json();
                setData(d);
                // Auto-expand all modules
                setExpandedModules(new Set((d.modules || []).map((g: ModuleGroup) => g.module.id)));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeProjectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtered data
    const filteredModules = useMemo(() => {
        if (!data?.modules) return [];
        return data.modules
            .map(g => ({
                ...g,
                testCases: g.testCases.filter(tc => {
                    const matchSearch = !searchQuery ||
                        tc.testId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        tc.title.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchPriority = !filterPriority || tc.priority === filterPriority;
                    const matchModule = !filterModuleId || tc.moduleId === filterModuleId;
                    return matchSearch && matchPriority && matchModule;
                }),
            }))
            .filter(g => g.testCases.length > 0 || (!searchQuery && !filterPriority));
    }, [data, searchQuery, filterPriority, filterModuleId]);

    const totalFiltered = useMemo(() =>
        filteredModules.reduce((sum, g) => sum + g.testCases.length, 0),
        [filteredModules]
    );

    const toggleModule = (id: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // CRUD handlers
    const openCreateModal = (moduleId?: string) => {
        setModalMode('create');
        setEditingCase(null);
        const nextId = data ? `TC-${String(data.totalCases + 1).padStart(3, '0')}` : 'TC-001';
        setForm({ testId: nextId, title: '', steps: '', expectedResult: '', priority: 'P2', moduleId: moduleId || '' });
    };

    const openEditModal = (tc: TestCase) => {
        setModalMode('edit');
        setEditingCase(tc);
        setForm({
            testId: tc.testId,
            title: tc.title,
            steps: tc.steps,
            expectedResult: tc.expectedResult,
            priority: tc.priority,
            moduleId: tc.moduleId,
        });
    };

    const handleSave = async () => {
        if (!form.testId || !form.title || !form.steps || !form.expectedResult || !form.moduleId) return;

        if (modalMode === 'create') {
            const res = await fetch('/api/test-cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setModalMode(null);
                fetchData();
            }
        } else if (modalMode === 'edit' && editingCase) {
            const res = await fetch(`/api/test-cases/${editingCase.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setModalMode(null);
                fetchData();
            }
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const res = await fetch(`/api/test-cases/${deleteTarget.id}`, { method: 'DELETE' });
        if (res.ok) {
            setDeleteTarget(null);
            fetchData();
        }
    };

    // Export
    const handleExport = (format: 'markdown' | 'csv') => {
        if (!data?.modules) return;

        let content = '';
        if (format === 'markdown') {
            for (const g of data.modules) {
                content += `## ${g.module.name}\n\n`;
                content += '| ID | Title | Steps | Expected Result | Priority |\n';
                content += '|---|---|---|---|---|\n';
                for (const tc of g.testCases) {
                    content += `| ${tc.testId} | ${tc.title} | ${tc.steps} | ${tc.expectedResult} | ${tc.priority} |\n`;
                }
                content += '\n';
            }
        } else {
            content = 'Test ID,Title,Steps,Expected Result,Priority,Module\n';
            for (const g of data.modules) {
                for (const tc of g.testCases) {
                    content += `"${tc.testId}","${tc.title}","${tc.steps.replace(/"/g, '""')}","${tc.expectedResult.replace(/"/g, '""')}","${tc.priority}","${g.module.name}"\n`;
                }
            }
        }

        const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-cases.${format === 'csv' ? 'csv' : 'md'}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!activeProjectId) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Test Cases</h1>
                <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
                    Please select a project to view test cases.
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Test Cases</h1>
                    <p className="text-muted-foreground mt-1">
                        {data?.totalCases || 0} test cases across {data?.modules?.length || 0} modules
                        {totalFiltered !== (data?.totalCases || 0) && ` (${totalFiltered} shown)`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <button className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent transition-colors">
                            <Download className="h-4 w-4" /> Export
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg hidden group-hover:block z-20 min-w-[140px]">
                            <button onClick={() => handleExport('markdown')} className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors rounded-t-lg">
                                Markdown (.md)
                            </button>
                            <button onClick={() => handleExport('csv')} className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors rounded-b-lg">
                                CSV (.csv)
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => openCreateModal()}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" /> Add Test Case
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by ID or title..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Priorities</option>
                    <option value="P1">P1 — Critical</option>
                    <option value="P2">P2 — High</option>
                    <option value="P3">P3 — Medium</option>
                    <option value="P4">P4 — Low</option>
                </select>
                <select
                    value={filterModuleId}
                    onChange={e => setFilterModuleId(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary max-w-[200px]"
                >
                    <option value="">All Modules</option>
                    {data?.modules?.map(g => (
                        <option key={g.module.id} value={g.module.id}>{g.module.name}</option>
                    ))}
                </select>
                {(searchQuery || filterPriority || filterModuleId) && (
                    <button
                        onClick={() => { setSearchQuery(''); setFilterPriority(''); setFilterModuleId(''); }}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        <X className="h-3.5 w-3.5" /> Clear
                    </button>
                )}
            </div>

            {/* Module tree */}
            {loading ? (
                <div className="text-center py-20 text-muted-foreground">Loading...</div>
            ) : filteredModules.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl space-y-3">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
                    <p className="text-base">{data?.totalCases ? 'No test cases match your filters' : 'No test cases yet'}</p>
                    {!data?.totalCases && (
                        <p className="text-sm">Import a test plan or create test cases manually</p>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredModules.map(g => (
                        <div key={g.module.id} className="border border-border rounded-xl overflow-hidden bg-card">
                            {/* Module header */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleModule(g.module.id)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleModule(g.module.id); }}
                                className="group w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left cursor-pointer"
                            >
                                {expandedModules.has(g.module.id) ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-medium flex-1 truncate">{g.module.name}</span>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    {g.testCases.length}
                                </span>
                                <button
                                    onClick={e => { e.stopPropagation(); openCreateModal(g.module.id); }}
                                    className="p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                    title="Add test case to this module"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Test cases */}
                            {expandedModules.has(g.module.id) && (
                                <div className="border-t border-border">
                                    {/* Table header */}
                                    <div className="grid grid-cols-[80px_1fr_80px_60px] px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                                        <div>ID</div>
                                        <div>Title</div>
                                        <div>Priority</div>
                                        <div className="text-right">Actions</div>
                                    </div>
                                    {g.testCases.map(tc => (
                                        <div
                                            key={tc.id}
                                            className="group grid grid-cols-[80px_1fr_80px_60px] items-center px-4 py-2.5 border-t border-border/50 hover:bg-accent/30 transition-colors"
                                        >
                                            <div className="text-xs font-mono text-muted-foreground">{tc.testId}</div>
                                            <div className="text-sm truncate pr-4" title={tc.title}>{tc.title}</div>
                                            <div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[tc.priority] || PRIORITY_COLORS.P4}`}>
                                                    {tc.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(tc)}
                                                    className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(tc)}
                                                    className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {modalMode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-popover border border-border rounded-xl p-6 w-[550px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                {modalMode === 'create' ? 'Create Test Case' : 'Edit Test Case'}
                            </h3>
                            <button onClick={() => setModalMode(null)} className="p-1 hover:bg-accent rounded">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Test ID</label>
                                    <input
                                        type="text"
                                        value={form.testId}
                                        onChange={e => setForm(f => ({ ...f, testId: e.target.value }))}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g. TC-001"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="P1">P1 — Critical</option>
                                        <option value="P2">P2 — High</option>
                                        <option value="P3">P3 — Medium</option>
                                        <option value="P4">P4 — Low</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Module</label>
                                <select
                                    value={form.moduleId}
                                    onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select module...</option>
                                    {data?.modules?.map(g => (
                                        <option key={g.module.id} value={g.module.id}>{g.module.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="What does this test verify?"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Steps</label>
                                <textarea
                                    value={form.steps}
                                    onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Expected Result</label>
                                <textarea
                                    value={form.expectedResult}
                                    onChange={e => setForm(f => ({ ...f, expectedResult: e.target.value }))}
                                    rows={2}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="What should happen?"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                onClick={() => setModalMode(null)}
                                className="px-4 py-2 text-sm rounded-md border border-input hover:bg-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!form.testId || !form.title || !form.steps || !form.expectedResult || !form.moduleId}
                                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 font-medium"
                            >
                                {modalMode === 'create' ? 'Create' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-popover border border-border rounded-xl p-6 w-96 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Delete Test Case</h3>
                                <p className="text-sm text-muted-foreground">{deleteTarget.testId}: {deleteTarget.title}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This will permanently remove this test case and all associated test results. This action cannot be undone.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm rounded-md border border-input hover:bg-accent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
