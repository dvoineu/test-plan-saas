import type { Attachment, CreateAttachmentDTO } from '../../types';

export interface IAttachmentRepository {
    findById(id: string): Promise<Attachment | null>;
    create(data: CreateAttachmentDTO): Promise<Attachment>;
    delete(id: string): Promise<void>;
    deleteAll(): Promise<void>;
}
