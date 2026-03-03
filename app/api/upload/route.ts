import { NextResponse } from 'next/server';
import { TestPlanService } from '@/domains/test-design/services/test-plan.service';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const testPlanService = new TestPlanService();
    await testPlanService.parseAndSaveMarkdown(text);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return NextResponse.json({ error: 'Failed to parse markdown' }, { status: 500 });
  }
}
