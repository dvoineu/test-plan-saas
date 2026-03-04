export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { attachmentService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';

export const DELETE = withApiHandler(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await attachmentService.deleteAttachment(id);
  return NextResponse.json({ success: true });
});
