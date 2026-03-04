export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { jiraAdapter } from '@/infrastructure/container';
import { withApiHandler } from '@/app/api/_lib/withApiHandler';
import { createJiraIssueSchema } from '@/app/api/_lib/schemas';

export const POST = withApiHandler(async (req: Request) => {
    const body = await req.json();
    const { summary, description, issueType } = createJiraIssueSchema.parse(body);

    const issue = await jiraAdapter.createBug({
        title: summary,
        descriptionMarkdown: description || '',
        priority: 'P3',
    });

    return NextResponse.json({ success: true, issue });
});
