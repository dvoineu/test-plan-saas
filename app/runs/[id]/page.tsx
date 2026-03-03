import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { TestRunClient } from './TestRunClient';

export default async function RunDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const run = await prisma.testRun.findUnique({
    where: { id },
    include: {
      testResults: {
        include: {
          testCase: {
            include: { module: true }
          }
        },
        orderBy: {
          testCase: {
            testId: 'asc'
          }
        }
      }
    }
  });

  if (!run) {
    notFound();
  }

  // Group results by module
  const modules: Record<string, { id: string, name: string, results: any[] }> = {};
  
  run.testResults.forEach((result) => {
    const mod = result.testCase.module;
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
