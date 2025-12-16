import type { AIProvider, AIProviderType } from './types';
import { OpenAIProvider, type OpenAIProviderOptions } from './providers/openai';
import { AnthropicProvider, type AnthropicProviderOptions } from './providers/anthropic';
import { OllamaProvider, type OllamaProviderOptions } from './providers/ollama';
import { CustomProvider, type CustomProviderOptions } from './providers/custom';

export type ProviderOptions = {
  openai: OpenAIProviderOptions;
  anthropic: AnthropicProviderOptions;
  ollama: OllamaProviderOptions;
  custom: CustomProviderOptions;
};

/**
 * Create an AI provider
 *
 * @example
 * ```ts
 * // OpenAI
 * const openai = createAIProvider('openai', { apiKey: '...' });
 *
 * // Anthropic (Claude)
 * const claude = createAIProvider('anthropic', { apiKey: '...' });
 *
 * // Ollama (local)
 * const ollama = createAIProvider('ollama', { model: 'llama3' });
 *
 * // Custom endpoint
 * const custom = createAIProvider('custom', {
 *   endpoint: 'https://my-api.com/ai',
 *   headers: { 'Authorization': 'Bearer xxx' },
 * });
 * ```
 */
export function createAIProvider<T extends AIProviderType>(
  type: T,
  options: ProviderOptions[T]
): AIProvider {
  switch (type) {
    case 'openai':
      return new OpenAIProvider(options as OpenAIProviderOptions);
    case 'anthropic':
      return new AnthropicProvider(options as AnthropicProviderOptions);
    case 'ollama':
      return new OllamaProvider(options as OllamaProviderOptions);
    case 'custom':
      return new CustomProvider(options as CustomProviderOptions);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}
