import { BaseLLMAdapter } from './BaseLLMAdapter';
import { LLMMessage, LLMResponse } from '@/domain/ports/ILLMProvider';
import { GoogleGenAI } from '@google/genai';

export class GeminiAdapter extends BaseLLMAdapter {
    readonly name = 'gemini';
    private ai: GoogleGenAI | null = null;
    private defaultModel = 'gemini-2.5-flash';

    constructor(apiKey?: string, model?: string) {
        super();
        const key = apiKey || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
        if (key) {
            // Ensure we format the options object correctly for the @google/genai SDK v1.17+
            this.ai = new GoogleGenAI({ apiKey: key });
        }
        if (model) {
            this.defaultModel = model;
        }
    }

    async chat(messages: LLMMessage[], options?: { temperature?: number; maxTokens?: number; responseFormat?: 'text' | 'json' }): Promise<LLMResponse> {
        if (!this.ai) {
            throw new Error('GeminiAdapter is not initialized with an API key');
        }

        try {
            let systemInstruction: string | undefined = undefined;
            const chatMessages = [];

            for (const msg of messages) {
                if (msg.role === 'system') {
                    systemInstruction = msg.content;
                } else {
                    chatMessages.push({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    });
                }
            }

            const response = await this.ai.models.generateContent({
                model: this.defaultModel,
                contents: chatMessages,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: options?.temperature ?? 0.7,
                    maxOutputTokens: options?.maxTokens,
                    responseMimeType: options?.responseFormat === 'json' ? 'application/json' : 'text/plain',
                }
            });

            return {
                content: response.text || '',
                model: this.defaultModel
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(`Failed to generate content with Gemini: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async isAvailable(): Promise<boolean> {
        return this.ai !== null;
    }
}
