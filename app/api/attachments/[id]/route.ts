import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const attachment = await prisma.testAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Delete file from disk
    try {
      const filePath = join(process.cwd(), 'public', attachment.filePath);
      await unlink(filePath);
    } catch (e) {
      console.error('Error deleting file from disk:', e);
    }

    // Delete record from DB
    await prisma.testAttachment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
  }
}
