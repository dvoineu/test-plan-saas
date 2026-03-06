export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testPlanService } from '@/infrastructure/container';
import { withApiHandler } from '../_lib/withApiHandler';

export const POST = withApiHandler(async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const projectId = formData.get('projectId') as string;

  if (!file || !projectId) {
    return NextResponse.json(
      { error: 'No file or projectId provided', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const text = await file.text();
  await testPlanService.parseAndSaveMarkdown(text, projectId);

  return NextResponse.json({ success: true });
});
