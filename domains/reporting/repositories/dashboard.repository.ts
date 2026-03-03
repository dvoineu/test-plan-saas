import { prisma } from '@/lib/prisma';

export class DashboardRepository {
  async getLatestRun() {
    return prisma.testRun.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        testResults: {
          include: {
            testCase: {
              include: { module: true }
            }
          }
        }
      }
    });
  }
}
