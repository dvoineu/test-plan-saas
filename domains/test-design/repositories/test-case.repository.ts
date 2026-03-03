import { prisma } from '@/lib/prisma';

export class TestCaseRepository {
  async findByTestId(testId: string) {
    return prisma.testCase.findFirst({ where: { testId } });
  }

  async create(data: {
    testId: string;
    title: string;
    steps: string;
    expectedResult: string;
    priority: string;
    moduleId: string;
  }) {
    return prisma.testCase.create({ data });
  }

  async findAll() {
    return prisma.testCase.findMany();
  }

  async count() {
    return prisma.testCase.count();
  }

  async deleteAll() {
    return prisma.testCase.deleteMany();
  }
}
