import { NextResponse } from 'next/server';
import { aiBugReportService } from '@/infrastructure/container';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { contextPrompt } = body;

        const reportMarkdown = await aiBugReportService.generateBugReport(id, contextPrompt);

        return NextResponse.json({ success: true, report: reportMarkdown });
    } catch (error: any) {
        console.error(`API /api/runs/[id]/bug-report error for run ${error}:`, error);
        return NextResponse.json({ error: error.message || 'Failed to generate bug report' }, { status: 500 });
    }
}
