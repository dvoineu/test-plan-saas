import { prisma } from '@/lib/prisma';

export class ModuleRepository {
  async findByName(name: string) {
    return prisma.module.findFirst({ where: { name } });
  }

  async create(name: string, description?: string) {
    return prisma.module.create({
      data: { name, description },
    });
  }

  async deleteAll() {
    return prisma.module.deleteMany();
  }
}
