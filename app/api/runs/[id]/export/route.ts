export const dynamic = 'force-dynamic';

import { reportService } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';

export const GET = withApiHandler(async (
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const htmlReport = await reportService.generateHTMLReport(id);

    return new Response(htmlReport, {
        headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="report-${id}.html"`
        }
    });
});
