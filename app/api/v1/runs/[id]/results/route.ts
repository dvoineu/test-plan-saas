export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';

/**
 * @api {put} /api/v1/runs/:id/results Bulk Update Results
 * @apiDescription Update results for multiple test cases within a specific run (e.g., from an automated test runner)
 * @apiBody {Array} results Array of { testId: string, status: 'PASSED' | 'FAILED' | 'BLOCKED', notes?: string }
 */
export const PUT = withApiHandler(async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const body = await req.json();
    const { results } = body;

    if (!Array.isArray(results)) {
        return NextResponse.json(
            { error: 'results must be an array', code: 'VALIDATION_ERROR' },
            { status: 400 },
        );
    }

    // getRunById now throws NotFoundError if not found
    const run = await testRunService.getRunById(id);

    const updatedCount = { success: 0, failed: 0 };
    const errors: string[] = [];

    for (const item of results) {
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
});
