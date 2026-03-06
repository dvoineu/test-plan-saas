import type { ILLMProvider } from './ILLMProvider';

/**
 * Port: LLM Provider Factory
 * Abstracts over the creation of LLM providers so that the domain layer
 * has zero knowledge of concrete implementations (Ollama, Gemini, etc.).
 */
export interface ILLMProviderFactory {
    create(): Promise<ILLMProvider>;
}
