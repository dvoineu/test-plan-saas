import { NextResponse } from 'next/server';
import { aiTestGenerationService, testPlanService } from '@/infrastructure/container';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { files, contextPrompt, saveImmediately, projectId } = body;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return NextResponse.json({ error: 'No files provided for analysis' }, { status: 400 });
        }

        if (saveImmediately && !projectId) {
            return NextResponse.json({ error: 'projectId is required if saveImmediately is true' }, { status: 400 });
        }

        if (files.length > 50) {
            return NextResponse.json({ error: 'Too many files. Max 50 files allowed per request.' }, { status: 400 });
        }

        const generatedModules = await aiTestGenerationService.generateTestPlan(files, contextPrompt);

        if (saveImmediately) {
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
    } catch (error: any) {
        console.error('API /api/ai/generate-plan error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate test plan' }, { status: 500 });
    }
}
