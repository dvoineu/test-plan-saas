import { NextResponse } from 'next/server';
import { DatabaseService } from '@/domains/system/services/database.service';

export async function POST() {
  try {
    const databaseService = new DatabaseService();
    await databaseService.clearAllData();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}
