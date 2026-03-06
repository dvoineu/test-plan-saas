import { BaseLLMAdapter } from './BaseLLMAdapter';
import { LLMMessage, LLMResponse } from '@/domain/ports/ILLMProvider';

/**
 * Adapter for any OpenAI-compatible API.
 * Works with: OpenAI, Mistral, Together, Groq, LM Studio, llama.cpp server, vLLM, etc.
 */
export class OpenAICompatibleAdapter extends BaseLLMAdapter {
    readonly name: string = 'openai-compatible';
    protected baseUrl: string;
    protected defaultModel: string;
    protected apiKey: string;

    constructor(baseUrl: string, apiKey: string, model: string) {
        super();
        this.baseUrl = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
        this.apiKey = apiKey || '';
        this.defaultModel = model || 'gpt-4o-mini';
    }

    /**
     * Build request headers. Subclasses (e.g. OpenRouter) can override to add extra headers.
     */
    protected buildHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }

    async chat(
        messages: LLMMessage[],
        options?: { temperature?: number; maxTokens?: number; responseFormat?: 'text' | 'json' },
    ): Promise<LLMResponse> {
        try {
            const body: Record<string, unknown> = {
                model: this.defaultModel,
                messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: options?.temperature ?? 0.7,
            };

            if (options?.maxTokens) {
                body.max_tokens = options.maxTokens;
            }

            if (options?.responseFormat === 'json') {
                body.response_format = { type: 'json_object' };
            }

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: this.buildHeaders(),
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                throw new Error(`OpenAI-compatible API error: HTTP ${response.status} – ${errorBody}`);
            }

            const data = await response.json();
            const choice = data.choices?.[0];

            return {
                content: choice?.message?.content || '',
                tokensUsed: data.usage?.total_tokens,
                model: data.model || this.defaultModel,
            };
        } catch (error) {
            console.error('OpenAI-compatible API Error:', error);
            throw new Error(
                `Failed to generate content with OpenAI-compatible provider: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    async isAvailable(): Promise<boolean> {
        if (!this.apiKey && !this.baseUrl.includes('localhost')) {
            return false;
        }
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: this.buildHeaders(),
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}
