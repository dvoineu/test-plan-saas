'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Circle, 
  ChevronRight, 
  Search,
  Filter,
  ArrowLeft,
  Download,
  Paperclip,
  Trash2,
  FileText,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

type Status = 'PASSED' | 'FAILED' | 'BLOCKED' | 'UNTESTED';

const STATUS_CONFIG = {
  PASSED: { color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2, label: 'Passed' },
  FAILED: { color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'Failed' },
  BLOCKED: { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: AlertCircle, label: 'Blocked' },
  UNTESTED: { color: 'text-slate-400', bg: 'bg-slate-400/10', icon: Circle, label: 'Untested' },
};

export function TestRunClient({ run, initialModules }: { run: any, initialModules: any[] }) {
  const [modules, setModules] = useState(initialModules);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const massUpdateStatus = async (status: Status) => {
    if (selectedResultIds.size === 0) return;
    
    try {
      const promises = Array.from(selectedResultIds).map(id => 
        fetch('/api/results', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resultId: id, status }),
        })
      );
      
      await Promise.all(promises);
      
      setModules(prev => prev.map(m => ({
        ...m,
        results: m.results.map((r: any) => selectedResultIds.has(r.id) ? { ...r, status } : r)
      })));
      
      setSelectedResultIds(new Set());
    } catch (error) {
      console.error(error);
    }
  };

  // Flattened list for keyboard navigation
  const allResults = modules.flatMap(m => m.results).filter((r: any) => {
    const matchesSearch = r.testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.testCase.testId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.testCase.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const selectedResult = allResults.find((r: any) => r.id === selectedResultId) || allResults[selectedIndex];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedResult) return;

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resultId', selectedResult.id);

      try {
        const res = await fetch('/api/attachments', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const newAttachment = await res.json();
          setModules(prev => prev.map(m => ({
            ...m,
            results: m.results.map((r: any) => r.id === selectedResult.id ? { 
              ...r, 
              attachments: [...(r.attachments || []), newAttachment] 
            } : r)
          })));
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [selectedResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const deleteAttachment = async (id: string) => {
    try {
      const res = await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setModules(prev => prev.map(m => ({
          ...m,
          results: m.results.map((r: any) => r.id === selectedResult?.id ? { 
            ...r, 
            attachments: r.attachments.filter((a: any) => a.id !== id) 
          } : r)
        })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = useCallback(async (resultId: string, status: Status) => {
    try {
      const res = await fetch('/api/results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, status }),
      });

      if (res.ok) {
        setModules(prev => prev.map(m => ({
          ...m,
          results: m.results.map((r: any) => r.id === resultId ? { ...r, status } : r)
        })));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (allResults[selectedIndex]) {
            setSelectedResultId(allResults[selectedIndex].id);
          }
          break;
        case '1':
          if (allResults[selectedIndex]) updateStatus(allResults[selectedIndex].id, 'PASSED');
          break;
        case '2':
          if (allResults[selectedIndex]) updateStatus(allResults[selectedIndex].id, 'FAILED');
          break;
        case '3':
          if (allResults[selectedIndex]) updateStatus(allResults[selectedIndex].id, 'BLOCKED');
          break;
        case 'Escape':
          setSelectedResultId(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allResults, selectedIndex, updateStatus]);

  // Stats for progress bar
  const stats = {
    PASSED: allResults.filter((r: any) => r.status === 'PASSED').length,
    FAILED: allResults.filter((r: any) => r.status === 'FAILED').length,
    BLOCKED: allResults.filter((r: any) => r.status === 'BLOCKED').length,
    UNTESTED: allResults.filter((r: any) => r.status === 'UNTESTED').length,
    total: allResults.length
  };

  const getPercent = (val: number) => (val / stats.total) * 100 || 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/runs" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">{run.name}</h1>
          </div>
          <button 
            onClick={() => window.open(`/api/runs/${run.id}/export`, '_blank')}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="bg-green-500 transition-all" style={{ width: `${getPercent(stats.PASSED)}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${getPercent(stats.FAILED)}%` }} />
          <div className="bg-orange-500 transition-all" style={{ width: `${getPercent(stats.BLOCKED)}%` }} />
        </div>
        <div className="mt-2 flex gap-4 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> {stats.PASSED} Passed</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> {stats.FAILED} Failed</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> {stats.BLOCKED} Blocked</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" /> {stats.UNTESTED} Untested</span>
        </div>
      </header>

      {/* Toolbar */}
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
            className="bg-transparent text-sm font-medium outline-none"
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
            className="bg-transparent text-sm font-medium outline-none"
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
            <button onClick={() => setSelectedResultIds(new Set())} className="text-xs font-bold text-muted-foreground hover:underline">Clear</button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Test List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {modules.map((module) => {
            const filteredResults = module.results.filter((r: any) => {
              const matchesSearch = r.testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   r.testCase.testId.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
              const matchesPriority = priorityFilter === 'ALL' || r.testCase.priority === priorityFilter;
              return matchesSearch && matchesStatus && matchesPriority;
            });

            if (filteredResults.length === 0) return null;

            return (
              <div key={module.id} className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">
                  {module.name}
                </h2>
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  {filteredResults.map((result: any, idx: number) => {
                    const globalIdx = allResults.findIndex((r: any) => r.id === result.id);
                    const isSelected = globalIdx === selectedIndex;
                    const StatusIcon = STATUS_CONFIG[result.status as Status].icon;
                    
                    return (
                      <div
                        key={result.id}
                        onClick={() => {
                          setSelectedIndex(globalIdx);
                          setSelectedResultId(result.id);
                        }}
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
                          checked={selectedResultIds.has(result.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedResultIds(prev => {
                              const next = new Set(prev);
                              if (checked) next.add(result.id);
                              else next.delete(result.id);
                              return next;
                            });
                          }}
                        />
                        <div className={cn("p-1 rounded-md", STATUS_CONFIG[result.status as Status].bg)}>
                          <StatusIcon className={cn("h-4 w-4", STATUS_CONFIG[result.status as Status].color)} />
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
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        {selectedResult && (
          <div className="w-[450px] border-l bg-card p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono font-bold text-muted-foreground">{selectedResult.testCase.testId}</span>
              <button 
                onClick={() => setSelectedResultId(null)}
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
                  {(['PASSED', 'FAILED', 'BLOCKED', 'UNTESTED'] as Status[]).map((s) => {
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
                  onBlur={async (e) => {
                    const notes = e.target.value;
                    if (notes === selectedResult.notes) return;
                    
                    try {
                      await fetch('/api/results', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resultId: selectedResult.id, notes }),
                      });
                      setModules(prev => prev.map(m => ({
                        ...m,
                        results: m.results.map((r: any) => r.id === selectedResult.id ? { ...r, notes } : r)
                      })));
                    } catch (error) {
                      console.error(error);
                    }
                  }}
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
                  <div className="mt-4 space-y-2">
                    {selectedResult.attachments.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border text-xs">
                        <div className="flex items-center gap-2 truncate">
                          {a.fileType.startsWith('image/') ? <ImageIcon className="h-4 w-4" /> : 
                           a.fileType.startsWith('video/') ? <Film className="h-4 w-4" /> : 
                           <FileText className="h-4 w-4" />}
                          <a href={a.filePath} target="_blank" className="truncate hover:underline">{a.filePath.split('-').slice(1).join('-')}</a>
                        </div>
                        <button onClick={() => deleteAttachment(a.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
