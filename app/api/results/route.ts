export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';
import { updateResultSchema } from '@/app/api/_lib/schemas';

export const PATCH = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const { resultId, status, notes } = updateResultSchema.parse(body);

  const updatedResult = await testRunService.updateResult(resultId, {
    status: status || undefined,
    notes: notes !== undefined ? notes : undefined,
  });

  return NextResponse.json(updatedResult);
});
