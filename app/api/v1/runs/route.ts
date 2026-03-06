export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';
import { createRunSchema } from '@/app/api/_lib/schemas';

/**
 * @api {post} /api/v1/runs Create Test Run
 * @apiDescription Create a new Test Run externally (e.g., from a CI pipeline)
 * @apiBody {String} name Name of the test run to create
 */
export const POST = withApiHandler(async (req: Request) => {
    const body = await req.json();
    const { name, projectId } = createRunSchema.parse(body);

    const run = await testRunService.createRun(name, projectId);

    return NextResponse.json({
        success: true,
        run: {
            id: run.id,
            name: run.name,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/runs/${run.id}`
        }
    });
});
