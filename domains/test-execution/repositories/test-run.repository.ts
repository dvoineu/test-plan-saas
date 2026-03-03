import { prisma } from '@/lib/prisma';

export class TestRunRepository {
  async findAll() {
    return prisma.testRun.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        testResults: true,
        _count: {
          select: { testResults: true }
        }
      },
    });
  }

  async findById(id: string) {
    return prisma.testRun.findUnique({
      where: { id },
      include: {
        testResults: {
          include: {
            testCase: {
              include: {
                module: true,
              },
            },
            attachments: true,
          },
        },
      },
    });
  }

  async create(name: string) {
    return prisma.testRun.create({
      data: { name },
    });
  }

  async count() {
    return prisma.testRun.count();
  }

  async deleteAll() {
    return prisma.testRun.deleteMany();
  }
}
