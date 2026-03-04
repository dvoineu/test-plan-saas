import { NextResponse } from 'next/server';
import { projectService } from '@/infrastructure/container';

export async function GET() {
    try {
        const projects = await projectService.getAllProjects();
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Failed to get projects:', error);
        return NextResponse.json({ error: 'Failed to retrieve projects' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, description } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const project = await projectService.createProject({ name, description });
        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
