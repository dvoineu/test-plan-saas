export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dashboardService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';

export const GET = withApiHandler(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json(
            { error: 'projectId is required', code: 'VALIDATION_ERROR' },
            { status: 400 },
        );
    }

    const stats = await dashboardService.getDashboardStats(projectId);
    return NextResponse.json(stats);
});
