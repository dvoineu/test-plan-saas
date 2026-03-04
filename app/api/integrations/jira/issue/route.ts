import { NextResponse } from 'next/server';
import { jiraAdapter } from '@/infrastructure/container';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, descriptionMarkdown, priority } = body;

        if (!title || !descriptionMarkdown) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const issue = await jiraAdapter.createBug({
            title,
            descriptionMarkdown,
            priority: priority || 'P3',
        });

        return NextResponse.json({ success: true, issue });
    } catch (error: any) {
        console.error('API /api/integrations/jira/issue error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create Jira issue' }, { status: 500 });
    }
}
