export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { testCaseRepo, moduleRepo } from '@/infrastructure/container';
import { withApiHandler } from '../_lib/withApiHandler';
import { createTestCaseSchema } from '../_lib/schemas';

// GET /api/test-cases?projectId=xxx — list all test cases for a project, grouped by module
export const GET = withApiHandler(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
        return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const [cases, modules] = await Promise.all([
        testCaseRepo.findAll(projectId),
        moduleRepo.findAll(projectId),
    ]);

    // Group by module
    const grouped = modules.map(mod => ({
        module: mod,
        testCases: cases.filter(tc => tc.moduleId === mod.id),
    }));

    return NextResponse.json({ modules: grouped, totalCases: cases.length });
});

// POST /api/test-cases — create a test case
export const POST = withApiHandler(async (req: Request) => {
    const body = await req.json();
    const data = createTestCaseSchema.parse(body);
    const testCase = await testCaseRepo.create(data);
    return NextResponse.json(testCase, { status: 201 });
});
