import { prisma } from '@/lib/prisma';

export class TestResultRepository {
  async createMany(data: { testRunId: string; testCaseId: string }[]) {
    return prisma.testResult.createMany({ data });
  }

  async update(id: string, data: { status?: string; notes?: string }) {
    return prisma.testResult.update({
      where: { id },
      data,
    });
  }

  async deleteAll() {
    return prisma.testResult.deleteMany();
  }
}
