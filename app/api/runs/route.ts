export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';
import { withApiHandler } from '../_lib/withApiHandler';
import { createRunSchema } from '../_lib/schemas';

export const GET = withApiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required', code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const runs = await testRunService.getAllRuns(projectId);
  return NextResponse.json(runs);
});

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const { name, projectId } = createRunSchema.parse(body);
  const run = await testRunService.createRun(name, projectId);
  return NextResponse.json(run);
});
