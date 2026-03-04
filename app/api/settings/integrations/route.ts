export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { integrationSettingsService } from '@/infrastructure/container';
import { withApiHandler } from '../../_lib/withApiHandler';
import { updateSettingsSchema } from '../../_lib/schemas';

export const GET = withApiHandler(async () => {
    const settings = await integrationSettingsService.getSettings();
    return NextResponse.json(settings);
});

export const POST = withApiHandler(async (req: Request) => {
    const body = await req.json();
    const validatedData = updateSettingsSchema.parse(body);
    await integrationSettingsService.updateSettings(validatedData);
    return NextResponse.json({ success: true });
});
