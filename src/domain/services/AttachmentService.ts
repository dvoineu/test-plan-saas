import type { IAttachmentRepository } from '../ports/repositories/IAttachmentRepository';
import type { IStorageProvider } from '../ports/IStorageProvider';
import type { Attachment } from '../types';
import { NotFoundError } from '../errors';

/**
 * Service: Attachment
 * Manages file uploads/deletions for test results.
 * Uses IStorageProvider port — works with local fs, S3, etc.
 */
export class AttachmentService {
    constructor(
        private readonly attachmentRepo: IAttachmentRepository,
        private readonly storage: IStorageProvider,
    ) { }

    async uploadAttachment(file: File, resultId: string): Promise<Attachment> {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${safeName}`;

        const storedPath = await this.storage.upload(buffer, fileName, file.type);

        return this.attachmentRepo.create({
            filePath: storedPath,
            fileType: file.type,
            testResultId: resultId,
        });
    }

    async deleteAttachment(id: string): Promise<void> {
        const attachment = await this.attachmentRepo.findById(id);
        if (!attachment) {
            throw new NotFoundError('Attachment', id);
        }

        try {
            await this.storage.delete(attachment.filePath);
        } catch (e) {
            console.error('Failed to delete file from storage:', e);
        }

        await this.attachmentRepo.delete(id);
    }

    getAttachmentUrl(attachment: Attachment): string {
        return this.storage.getUrl(attachment.filePath);
    }
}
