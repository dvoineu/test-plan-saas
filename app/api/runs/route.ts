import { NextResponse } from 'next/server';
import { TestRunService } from '@/domains/test-execution/services/test-run.service';

export async function GET() {
  try {
    const testRunService = new TestRunService();
    const runs = await testRunService.getAllRuns();
    return NextResponse.json(runs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const testRunService = new TestRunService();
    const run = await testRunService.createRun(name);

    return NextResponse.json(run);
  } catch (error) {
    console.error('Error creating run:', error);
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
  }
}
