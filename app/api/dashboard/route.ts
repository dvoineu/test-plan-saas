export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dashboardService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';

export const GET = withApiHandler(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const daysParam = searchParams.get('days');

    if (!projectId) {
        return NextResponse.json(
            { error: 'projectId is required', code: 'VALIDATION_ERROR' },
            { status: 400 },
        );
    }

    const days = daysParam ? parseInt(daysParam, 10) : 14;
    const stats = await dashboardService.getDashboardStats(projectId, days);
    return NextResponse.json(stats);
});

