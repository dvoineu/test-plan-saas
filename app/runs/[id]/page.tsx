import { testRunService } from '@/infrastructure/container';
import { notFound } from 'next/navigation';
import { TestRunClient } from './TestRunClient';

export default async function RunDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Use domain service instead of raw prisma
  const run = await testRunService.getRunById(id);

  if (!run) {
    notFound();
  }

  // Group results by module for the UI
  const modules: Record<string, { id: string, name: string, results: any[] }> = {};

  (run.testResults || []).forEach((result: any) => {
    const mod = result.testCase?.module;
    if (!mod) return;

    if (!modules[mod.id]) {
      modules[mod.id] = {
        id: mod.id,
        name: mod.name,
        results: []
      };
    }
    modules[mod.id].results.push(result);
  });

  const groupedModules = Object.values(modules);

  return (
    <TestRunClient run={run} initialModules={groupedModules} />
  );
}
