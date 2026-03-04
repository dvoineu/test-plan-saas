import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await testRunService.finishRun(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API /api/runs/[id]/finish error:', error);
        return NextResponse.json({ error: 'Failed to finish run' }, { status: 500 });
    }
}
