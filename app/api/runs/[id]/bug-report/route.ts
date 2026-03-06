export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { aiBugReportService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';
import { generateBugReportSchema } from '@/app/api/_lib/schemas';

export const POST = withApiHandler(async (
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { contextPrompt } = generateBugReportSchema.parse(body);

    const reportMarkdown = await aiBugReportService.generateBugReport(id, contextPrompt);
    return NextResponse.json({ success: true, report: reportMarkdown });
});
