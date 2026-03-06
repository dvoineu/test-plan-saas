export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';

export const POST = withApiHandler(async (
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    await testRunService.finishRun(id);
    return NextResponse.json({ success: true });
});
