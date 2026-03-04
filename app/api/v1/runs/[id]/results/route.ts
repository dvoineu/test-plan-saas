import { NextResponse } from 'next/server';
import { testRunService, testPlanService } from '@/infrastructure/container';

/**
 * @api {put} /api/v1/runs/:id/results Bulk Update Results
 * @apiDescription Update results for multiple test cases within a specific run (e.g., from an automated test runner)
 * @apiBody {Array} results Array of { testId: string, status: 'PASSED' | 'FAILED' | 'BLOCKED', notes?: string }
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { results } = body;

        if (!Array.isArray(results)) {
            return NextResponse.json({ error: 'results must be an array' }, { status: 400 });
        }

        const run = await testRunService.getRunById(id);
        if (!run) {
            return NextResponse.json({ error: 'Test run not found' }, { status: 404 });
        }

        const updatedCount = { success: 0, failed: 0 };
        const errors: string[] = [];

        for (const item of results) {
            // Find the database result ID associated with the user's testId
            const resultMatch = run.testResults?.find(r => r.testCase.testId === item.testId);

            if (resultMatch) {
                try {
                    await testRunService.updateResult(resultMatch.id, {
                        status: item.status,
                        notes: item.notes
                    });
                    updatedCount.success++;
                } catch (e: any) {
                    updatedCount.failed++;
                    errors.push(`Failed to update testId ${item.testId}: ${e.message}`);
                }
            } else {
                updatedCount.failed++;
                errors.push(`testId ${item.testId} not found in this test run`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updatedCount.success} results. ${updatedCount.failed} failed.`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('API /api/v1/runs/[id]/results error:', error);
        return NextResponse.json({ error: 'Failed to bulk update results via external API' }, { status: 500 });
    }
}
