import { db } from '@/infrastructure/db/client';
import { testAttachments } from '@/infrastructure/db/schema';
import { eq } from 'drizzle-orm';
import type { IAttachmentRepository } from '@/domain/ports/repositories/IAttachmentRepository';
import type { Attachment, CreateAttachmentDTO } from '@/domain/types';

export class DrizzleAttachmentRepository implements IAttachmentRepository {
    async findById(id: string): Promise<Attachment | null> {
        const result = await db.select().from(testAttachments).where(eq(testAttachments.id, id)).limit(1);
        return result[0] ?? null;
    }

    async create(data: CreateAttachmentDTO): Promise<Attachment> {
        const result = await db.insert(testAttachments).values(data).returning();
        return result[0];
    }

    async delete(id: string): Promise<void> {
        await db.delete(testAttachments).where(eq(testAttachments.id, id));
    }

    async deleteAll(): Promise<void> {
        await db.delete(testAttachments);
    }
}
