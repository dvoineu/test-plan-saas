'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { TestStatus } from '@/domain/types';

import { TestRunHeader } from '@/ui/test-run/TestRunHeader';
import { TestRunToolbar } from '@/ui/test-run/TestRunToolbar';
import { TestResultRow } from '@/ui/test-run/TestResultRow';
import { TestResultDetail } from '@/ui/test-run/TestResultDetail';

import { useTestRunStore } from '@/infrastructure/state/store';

export function TestRunClient({ run, initialModules }: { run: any, initialModules: any[] }) {
  const [modules, setModules] = useState(initialModules);
  const {
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
    selectedResultIds, setSelectedResultIds, clearSelection,
    selectedIndex, setSelectedIndex,
    selectedResultId, setSelectedResultId
  } = useTestRunStore();

  const massUpdateStatus = async (status: TestStatus) => {
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

      clearSelection();
    } catch (error) {
      console.error(error);
    }
  };

  // Flattened list for keyboard navigation and filtering
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

  const dropzoneProps = useDropzone({ onDrop });

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

  const updateStatus = useCallback(async (resultId: string, status: TestStatus) => {
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

  const updateNotes = useCallback(async (resultId: string, notes: string) => {
    const result = allResults.find((r: any) => r.id === resultId);
    if (!result || result.notes === notes) return;

    try {
      await fetch('/api/results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, notes }),
      });
      setModules(prev => prev.map(m => ({
        ...m,
        results: m.results.map((r: any) => r.id === resultId ? { ...r, notes } : r)
      })));
    } catch (error) {
      console.error(error);
    }
  }, [allResults]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev: number) => Math.min(prev + 1, allResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev: number) => Math.max(prev - 1, 0));
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
  }, [allResults, selectedIndex, updateStatus, setSelectedResultId, setSelectedIndex]);

  // Stats for progress bar
  const stats = {
    PASSED: allResults.filter((r: any) => r.status === 'PASSED').length,
    FAILED: allResults.filter((r: any) => r.status === 'FAILED').length,
    BLOCKED: allResults.filter((r: any) => r.status === 'BLOCKED').length,
    UNTESTED: allResults.filter((r: any) => r.status === 'UNTESTED').length,
    total: allResults.length
  };

  return (
    <div className="flex h-full flex-col">
      <TestRunHeader run={run} stats={stats} />

      <TestRunToolbar
        massUpdateStatus={massUpdateStatus}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Test List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {modules.map((module) => {
            const moduleFilteredResults = module.results.filter((r: any) => allResults.some((allR: any) => allR.id === r.id));
            if (moduleFilteredResults.length === 0) return null;

            return (
              <div key={module.id} className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">
                  {module.name}
                </h2>
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  {moduleFilteredResults.map((result: any) => {
                    const globalIdx = allResults.findIndex((r: any) => r.id === result.id);
                    const isSelected = globalIdx === selectedIndex;

                    return (
                      <TestResultRow
                        key={result.id}
                        result={result}
                        isSelected={isSelected}
                        isChecked={selectedResultIds.has(result.id)}
                        onClick={() => {
                          setSelectedIndex(globalIdx);
                          setSelectedResultId(result.id);
                        }}
                        onCheck={(checked) => {
                          setSelectedResultIds((prev: Set<string>) => {
                            const next = new Set(prev);
                            if (checked) next.add(result.id);
                            else next.delete(result.id);
                            return next;
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <TestResultDetail
          selectedResult={selectedResult}
          onClose={() => setSelectedResultId(null)}
          updateStatus={updateStatus}
          updateNotes={updateNotes}
          deleteAttachment={deleteAttachment}
          dropzoneProps={dropzoneProps as any}
        />
      </div>
    </div>
  );
}
