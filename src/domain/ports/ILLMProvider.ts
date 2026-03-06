export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    tokensUsed?: number;
    model: string;
}

export interface ILLMProvider {
    /**
     * The unique identifier / name of the provider (e.g. 'gemini', 'ollama')
     */
    readonly name: string;

    /**
     * Send a list of messages to the LLM and receive a text/json response.
     */
    chat(messages: LLMMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
        responseFormat?: 'text' | 'json';
    }): Promise<LLMResponse>;

    /**
     * Check if the provider is properly configured and reachable.
     */
    isAvailable(): Promise<boolean>;
}
