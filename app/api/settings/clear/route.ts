export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { databaseService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';

export const POST = withApiHandler(async () => {
  await databaseService.clearAllData();
  return NextResponse.json({ success: true });
});
