import type { ILLMProviderFactory } from '@/domain/ports/ILLMProviderFactory';
import type { ILLMProvider } from '@/domain/ports/ILLMProvider';
import type { ISettingsRepository } from '@/domain/ports/repositories/ISettingsRepository';
import { OllamaAdapter } from './OllamaAdapter';
import { GeminiAdapter } from './GeminiAdapter';
import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';
import { OpenRouterAdapter } from './OpenRouterAdapter';
import { config } from '@/infrastructure/config';

/**
 * Adapter: LLM Provider Factory
 * Constructs the appropriate ILLMProvider based on persisted settings and config.
 * Lives in the adapter layer so that the domain has zero knowledge of concrete LLM implementations.
 */
export class LLMProviderFactoryAdapter implements ILLMProviderFactory {
    constructor(private readonly settingsRepo: ISettingsRepository) { }

    async create(): Promise<ILLMProvider> {
        const provider = await this.settingsRepo.get('llm_provider') || config.llm.provider;
        const model = await this.settingsRepo.get('llm_model') || config.llm.model;

        if (provider === 'ollama') {
            const baseUrl = await this.settingsRepo.get('llm_base_url') || config.llm.baseUrl;
            return new OllamaAdapter(baseUrl, model);
        }

        if (provider === 'openrouter') {
            const apiKey = await this.settingsRepo.get('llm_api_key') || config.llm.apiKey;
            return new OpenRouterAdapter(apiKey || '', model);
        }

        if (provider === 'openai-compatible') {
            const apiKey = await this.settingsRepo.get('llm_api_key') || config.llm.apiKey;
            const baseUrl = await this.settingsRepo.get('llm_base_url') || config.llm.baseUrl || 'https://api.openai.com/v1';
            return new OpenAICompatibleAdapter(baseUrl, apiKey || '', model);
        }

        // Default: Gemini
        const apiKey = await this.settingsRepo.get('llm_api_key') || config.llm.apiKey;
        return new GeminiAdapter(apiKey || '', model);
    }
}
