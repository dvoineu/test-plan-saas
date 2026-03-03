import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const runs = await prisma.testRun.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { testResults: true }
        }
      }
    });
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

    // Create the test run
    const run = await prisma.testRun.create({
      data: { name },
    });

    // Associate all existing test cases with this run as UNTESTED
    const testCases = await prisma.testCase.findMany();
    
    if (testCases.length > 0) {
      await prisma.testResult.createMany({
        data: testCases.map((tc) => ({
          testRunId: run.id,
          testCaseId: tc.id,
          status: 'UNTESTED',
        })),
      });
    }

    return NextResponse.json(run);
  } catch (error) {
    console.error('Error creating run:', error);
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
  }
}
