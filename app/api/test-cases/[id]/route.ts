export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testCaseRepo } from '@/infrastructure/container';
import { withApiHandler } from '../../_lib/withApiHandler';
import { updateTestCaseSchema } from '../../_lib/schemas';

// GET /api/test-cases/[id] — get a single test case
export const GET = withApiHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const testCase = await testCaseRepo.findById(id);
    if (!testCase) {
        return NextResponse.json({ error: 'Test case not found' }, { status: 404 });
    }
    return NextResponse.json(testCase);
});

// PUT /api/test-cases/[id] — update a test case
export const PUT = withApiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const data = updateTestCaseSchema.parse(body);
    const updated = await testCaseRepo.update(id, data);
    return NextResponse.json(updated);
});

// DELETE /api/test-cases/[id] — delete a test case
export const DELETE = withApiHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await testCaseRepo.delete(id);
    return NextResponse.json({ deleted: true });
});
