export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';
import { withApiHandler } from '../../_lib/withApiHandler';
import { renameRunSchema } from '../../_lib/schemas';

export const PATCH = withApiHandler(async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const body = await req.json();
    const { name } = renameRunSchema.parse(body);
    const run = await testRunService.renameRun(id, name);
    return NextResponse.json(run);
});

export const DELETE = withApiHandler(async (
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    await testRunService.deleteRun(id);
    return new NextResponse(null, { status: 204 });
});
