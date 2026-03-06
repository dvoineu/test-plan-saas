import { CreateIssueDTO, CreatedIssue, IIssueTracker } from '../../domain/ports/IIssueTracker';
import { IntegrationSettingsService } from '../../domain/services/IntegrationSettingsService';

export class JiraAdapter implements IIssueTracker {
    constructor(private readonly settingsService: IntegrationSettingsService) { }

    async createBug(dto: CreateIssueDTO): Promise<CreatedIssue> {
        const settings = await this.settingsService.getSettings();
        const jiraUrl = settings.jira_url;
        const email = settings.jira_email;
        const token = settings.jira_token;
        const projectKey = settings.jira_project;

        if (!jiraUrl || !email || !token || !projectKey) {
            throw new Error('Jira is not fully configured in Settings.');
        }

        // Clean trailing slashes
        const baseUrl = jiraUrl.replace(/\/$/, '');

        // Jira REST API v3 - create issue endpoint
        const endpoint = `${baseUrl}/rest/api/3/issue`;

        // Atlassian Document Format (ADF) for Jira Cloud v3 API
        // This is a simplified markdown-to-ADF conversion for the description.
        // For a full implementation, you'd use a parser, but paragraph + text works for basic markdown blocks.
        const adfDescription = {
            version: 1,
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: dto.descriptionMarkdown
                        }
                    ]
                }
            ]
        };

        const body = {
            fields: {
                project: {
                    key: projectKey
                },
                summary: dto.title,
                description: adfDescription,
                issuetype: {
                    name: "Bug"
                }
            }
        };

        const authBuffer = Buffer.from(`${email}:${token}`).toString('base64');

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authBuffer}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Jira API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        return {
            id: data.id,
            key: data.key,
            url: `${baseUrl}/browse/${data.key}`
        };
    }
}
