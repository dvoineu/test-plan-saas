export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { attachmentService } from '@/infrastructure/container';
import { withApiHandler } from '../_lib/withApiHandler';

export const POST = withApiHandler(async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const resultId = formData.get('resultId') as string;

  if (!file || !resultId) {
    return NextResponse.json(
      { error: 'Missing file or resultId', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const attachment = await attachmentService.uploadAttachment(file, resultId);
  return NextResponse.json(attachment);
});
