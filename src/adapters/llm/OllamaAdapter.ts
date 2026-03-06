import { BaseLLMAdapter } from './BaseLLMAdapter';
import { LLMMessage, LLMResponse } from '@/domain/ports/ILLMProvider';

export class OllamaAdapter extends BaseLLMAdapter {
    readonly name = 'ollama';
    private baseUrl: string;
    private defaultModel: string;

    constructor(baseUrl?: string, model?: string) {
        super();
        // Default to localhost Ollama port
        this.baseUrl = baseUrl || process.env.LLM_BASE_URL || 'http://localhost:11434';
        // Remove trailing slashes
        this.baseUrl = this.baseUrl.replace(/\/+$/, '');
        this.defaultModel = model || process.env.LLM_MODEL || 'llama3';
    }

    async chat(messages: LLMMessage[], options?: { temperature?: number; maxTokens?: number; responseFormat?: 'text' | 'json' }): Promise<LLMResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.defaultModel,
                    messages: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    format: options?.responseFormat === 'json' ? 'json' : undefined,
                    stream: false,
                    options: {
                        temperature: options?.temperature ?? 0.7,
                        num_predict: options?.maxTokens
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: HTTP ${response.status}`);
            }

            const data = await response.json();

            return {
                content: data.message?.content || '',
                model: data.model || this.defaultModel
            };
        } catch (error) {
            console.error('Ollama API Error:', error);
            throw new Error(`Failed to generate content with Ollama: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                // Check if the requested model exists locally
                return data.models?.some((m: any) => m.name.includes(this.defaultModel)) || false;
            }
            return false;
        } catch {
            return false;
        }
    }
}
