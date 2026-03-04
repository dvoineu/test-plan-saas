import { NextResponse } from 'next/server';
import { testRunService } from '@/infrastructure/container';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const run = await testRunService.renameRun(id, name);

        return NextResponse.json(run);
    } catch (error) {
        console.error('Error renaming run:', error);
        return NextResponse.json({ error: 'Failed to rename run' }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await testRunService.deleteRun(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting run:', error);
        return NextResponse.json({ error: 'Failed to delete run' }, { status: 500 });
    }
}

