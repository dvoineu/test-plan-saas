import { NextResponse } from 'next/server';
import { attachmentService } from '@/infrastructure/container';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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
