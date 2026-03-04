import { reportService } from '@/infrastructure/container';
import { notFound } from 'next/navigation';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const htmlReport = await reportService.generateHTMLReport(id);

        return new Response(htmlReport, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `attachment; filename="report-${id}.html"`
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return new Response('Not Found', { status: 404 });
    }
}
