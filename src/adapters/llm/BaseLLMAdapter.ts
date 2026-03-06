import { ILLMProvider, LLMMessage, LLMResponse } from '../../domain/ports/ILLMProvider';

export abstract class BaseLLMAdapter implements ILLMProvider {
    abstract readonly name: string;

    abstract chat(messages: LLMMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
        responseFormat?: 'text' | 'json';
    }): Promise<LLMResponse>;

    abstract isAvailable(): Promise<boolean>;

    /**
     * Helper to format a single string prompt into messages array
     */
    protected createMessages(prompt: string, systemPrompt?: string): LLMMessage[] {
        const messages: LLMMessage[] = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        return messages;
    }
}
