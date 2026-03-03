import { prisma } from '@/lib/prisma';

export class AttachmentRepository {
  async create(data: { filePath: string; fileType: string; testResultId: string }) {
    return prisma.testAttachment.create({ data });
  }

  async findById(id: string) {
    return prisma.testAttachment.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return prisma.testAttachment.delete({ where: { id } });
  }

  async deleteAll() {
    return prisma.testAttachment.deleteMany();
  }
}
