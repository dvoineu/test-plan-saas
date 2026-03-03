import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Delete in order of dependencies
    await prisma.testAttachment.deleteMany();
    await prisma.testResult.deleteMany();
    await prisma.testRun.deleteMany();
    await prisma.testCase.deleteMany();
    await prisma.module.deleteMany();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}
