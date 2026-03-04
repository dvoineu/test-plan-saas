import { NextResponse } from 'next/server';
import { integrationSettingsService } from '@/infrastructure/container';

export async function GET() {
    try {
        const settings = await integrationSettingsService.getSettings();
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await integrationSettingsService.updateSettings(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API update settings error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
