export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { projectService } from '@/infrastructure/container';
import { withApiHandler } from '../_lib/withApiHandler';
import { createProjectSchema } from '../_lib/schemas';

export const GET = withApiHandler(async () => {
    const projects = await projectService.getAllProjects();
    return NextResponse.json(projects);
});

export const POST = withApiHandler(async (req: Request) => {
    const body = await req.json();
    const { name, description } = createProjectSchema.parse(body);
    const project = await projectService.createProject({ name, description });
    return NextResponse.json(project);
});
