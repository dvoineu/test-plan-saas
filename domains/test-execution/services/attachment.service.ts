import { AttachmentRepository } from '../repositories/attachment.repository';
import fs from 'fs/promises';
import path from 'path';

export class AttachmentService {
  private attachmentRepo = new AttachmentRepository();

  async uploadAttachment(file: File, resultId: string) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicPath = `/uploads/${fileName}`;

    return this.attachmentRepo.create({
      filePath: publicPath,
      fileType: file.type,
      testResultId: resultId,
    });
  }

  async deleteAttachment(id: string) {
    const attachment = await this.attachmentRepo.findById(id);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const filePath = path.join(process.cwd(), 'public', attachment.filePath);
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.error('Failed to delete file from disk:', e);
    }

    await this.attachmentRepo.delete(id);
  }
}
