import { NextResponse } from 'next/server';
import { databaseService } from '@/infrastructure/container';

export async function POST() {
  try {
    await databaseService.clearAllData();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}
