import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const resultId = formData.get('resultId') as string;

    if (!file || !resultId) {
      return NextResponse.json({ error: 'Missing file or resultId' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const attachment = await prisma.testAttachment.create({
      data: {
        filePath: `/uploads/${fileName}`,
        fileType: file.type,
        testResultId: resultId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
}
