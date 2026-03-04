import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';

/**
 * @api {post} /api/v1/runs Create Test Run
 * @apiDescription Create a new Test Run externally (e.g., from a CI pipeline)
 * @apiBody {String} name Name of the test run to create
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, projectId } = body;

        if (!name || !projectId) {
            return NextResponse.json({ error: 'Name and projectId are required' }, { status: 400 });
        }

        const run = await testRunService.createRun(name, projectId);

        return NextResponse.json({
            success: true,
            run: {
                id: run.id,
                name: run.name,
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/runs/${run.id}`
            }
        });
    } catch (error: any) {
        console.error('API /api/v1/runs error:', error);
        return NextResponse.json({ error: 'Failed to create Test Run via external API' }, { status: 500 });
    }
}
