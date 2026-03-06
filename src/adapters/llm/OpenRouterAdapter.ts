import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';

/**
 * Adapter for OpenRouter — an aggregator proxy that provides access to
 * hundreds of models (OpenAI, Anthropic, Google, Meta, Mistral, etc.)
 * via a single OpenAI-compatible API with extra headers.
 *
 * @see https://openrouter.ai/docs/api-reference/overview
 */
export class OpenRouterAdapter extends OpenAICompatibleAdapter {
    override readonly name = 'openrouter';

    private static readonly BASE_URL = 'https://openrouter.ai/api/v1';

    constructor(apiKey: string, model: string) {
        super(OpenRouterAdapter.BASE_URL, apiKey, model || 'openai/gpt-4o-mini');
    }

    protected override buildHeaders(): Record<string, string> {
        return {
            ...super.buildHeaders(),
            // Required by OpenRouter for analytics / rate-limit attribution
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'QA-Hub Test Plan',
        };
    }
}
