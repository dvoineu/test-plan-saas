import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';

export async function PATCH(req: Request) {
  try {
    const { resultId, status, notes } = await req.json();

    if (!resultId) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 });
    }

    const updatedResult = await testRunService.updateResult(resultId, {
      status: status || undefined,
      notes: notes !== undefined ? notes : undefined,
    });

    return NextResponse.json(updatedResult);
  } catch (error) {
    console.error('Error updating result:', error);
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 });
  }
}
