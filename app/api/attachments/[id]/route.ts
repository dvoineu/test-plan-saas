import { NextResponse } from 'next/server';
import { AttachmentService } from '@/domains/test-execution/services/attachment.service';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const attachmentService = new AttachmentService();
    await attachmentService.deleteAttachment(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Attachment not found') {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }
    console.error('Error deleting attachment:', error);
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
  }
}
