import { NextResponse } from 'next/server';
import { AttachmentService } from '@/domains/test-execution/services/attachment.service';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const resultId = formData.get('resultId') as string;

    if (!file || !resultId) {
      return NextResponse.json({ error: 'Missing file or resultId' }, { status: 400 });
    }

    const attachmentService = new AttachmentService();
    const attachment = await attachmentService.uploadAttachment(file, resultId);

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
}
