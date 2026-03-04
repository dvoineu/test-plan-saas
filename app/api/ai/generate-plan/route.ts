export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { aiTestGenerationService, testPlanService } from '@/infrastructure/container';
import { withApiHandler } from '../../_lib/withApiHandler';
import { generatePlanSchema } from '../../_lib/schemas';

export const POST = withApiHandler(async (req: Request) => {
    const body = await req.json();
    const { files, contextPrompt, saveImmediately, projectId } = generatePlanSchema.parse(body);

    const generatedModules = await aiTestGenerationService.generateTestPlan(files, contextPrompt);

    if (saveImmediately && projectId) {
        for (const mod of generatedModules) {
            const createdModule = await testPlanService.createModule(mod.moduleName, projectId);
            for (const tc of mod.testCases) {
                await testPlanService.createTestCase({
                    testId: `${mod.moduleName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                    title: tc.title,
                    steps: tc.steps,
                    expectedResult: tc.expectedResult,
                    priority: tc.priority,
                    moduleId: createdModule.id
                });
            }
        }
    }

    return NextResponse.json({ success: true, modules: generatedModules });
});
