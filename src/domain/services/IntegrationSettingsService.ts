import { ISettingsRepository } from '../ports/repositories/ISettingsRepository';
import { ILLMProvider } from '../ports/ILLMProvider';
import { OllamaAdapter } from '@/adapters/llm/OllamaAdapter';
import { GeminiAdapter } from '@/adapters/llm/GeminiAdapter';
import { config } from '@/infrastructure/config';

export class IntegrationSettingsService {
    constructor(private settingsRepo: ISettingsRepository) { }

    async getLLMProvider(): Promise<ILLMProvider> {
        const provider = await this.settingsRepo.get('llm_provider') || config.llm.provider;
        const model = await this.settingsRepo.get('llm_model') || config.llm.model;

        if (provider === 'ollama') {
            const baseUrl = await this.settingsRepo.get('llm_base_url') || config.llm.baseUrl;
            return new OllamaAdapter(baseUrl, model);
        } else {
            const apiKey = await this.settingsRepo.get('llm_api_key') || config.llm.apiKey;
            return new GeminiAdapter(apiKey || '', model);
        }
    }

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
