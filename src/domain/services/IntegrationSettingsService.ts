import { ISettingsRepository } from '../ports/repositories/ISettingsRepository';

/**
 * Service: Integration Settings
 * Manages persisted settings for integrations (LLM, Jira, Slack).
 * Pure domain — no knowledge of concrete adapters.
 */
export class IntegrationSettingsService {
    constructor(private readonly settingsRepo: ISettingsRepository) { }

    async getSettings() {
        return this.settingsRepo.getAll([
            'llm_provider', 'llm_model', 'llm_base_url', 'llm_api_key',
            'jira_url', 'jira_email', 'jira_token', 'jira_project',
            'slack_webhook'
        ]);
    }

    async updateSettings(settingsData: {
        provider?: string; model?: string; baseUrl?: string; apiKey?: string;
        jiraUrl?: string; jiraEmail?: string; jiraToken?: string; jiraProject?: string;
        slackWebhook?: string;
    }) {
        if (settingsData.provider !== undefined) await this.settingsRepo.set('llm_provider', settingsData.provider);
        if (settingsData.model !== undefined) await this.settingsRepo.set('llm_model', settingsData.model);
        if (settingsData.baseUrl !== undefined) await this.settingsRepo.set('llm_base_url', settingsData.baseUrl);
        if (settingsData.apiKey !== undefined) await this.settingsRepo.set('llm_api_key', settingsData.apiKey);

        if (settingsData.jiraUrl !== undefined) await this.settingsRepo.set('jira_url', settingsData.jiraUrl);
        if (settingsData.jiraEmail !== undefined) await this.settingsRepo.set('jira_email', settingsData.jiraEmail);
        if (settingsData.jiraToken !== undefined) await this.settingsRepo.set('jira_token', settingsData.jiraToken);
        if (settingsData.jiraProject !== undefined) await this.settingsRepo.set('jira_project', settingsData.jiraProject);

        if (settingsData.slackWebhook !== undefined) await this.settingsRepo.set('slack_webhook', settingsData.slackWebhook);
    }
}
