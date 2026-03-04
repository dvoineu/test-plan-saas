import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const runs = await testRunService.getAllRuns(projectId);
    return NextResponse.json(runs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, projectId } = await req.json();

    if (!name || !projectId) {
      return NextResponse.json({ error: 'Name and projectId are required' }, { status: 400 });
    }

    const run = await testRunService.createRun(name, projectId);

    return NextResponse.json(run);
  } catch (error) {
    console.error('Error creating run:', error);
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
  }
}
