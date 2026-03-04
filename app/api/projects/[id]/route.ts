export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { projectService, moduleRepo, testCaseRepo, testRunRepo } from '@/infrastructure/container';
import { withApiHandler } from '../../_lib/withApiHandler';
import { createProjectSchema } from '../../_lib/schemas';

export const GET = withApiHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const project = await projectService.getProject(id);
    return NextResponse.json(project);
});

export const PUT = withApiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const data = createProjectSchema.parse(body);
    const updated = await projectService.updateProject(id, data);
    return NextResponse.json(updated);
});

export const DELETE = withApiHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    // Gather stats before deletion for the response
    const [modules, cases, runs] = await Promise.all([
        moduleRepo.findAll(id),
        testCaseRepo.findAll(id),
        testRunRepo.findAll(id),
    ]);

    await projectService.deleteProject(id);

    return NextResponse.json({
        deleted: true,
        stats: {
            modules: modules.length,
            cases: cases.length,
            runs: runs.length,
        },
    });
});
