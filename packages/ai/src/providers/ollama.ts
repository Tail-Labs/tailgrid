import { BaseAIProvider } from './base';
import type { AIProviderOptions } from '../types';

export interface OllamaProviderOptions extends AIProviderOptions {
  /** Ollama server endpoint (default: http://localhost:11434) */
  endpoint?: string;
  /** Model to use (default: llama2) */
  model?: string;
}

/**
 * Ollama provider for local LLM query parsing
 *
 * @example
 * ```ts
 * const provider = new OllamaProvider({
 *   endpoint: 'http://localhost:11434',
 *   model: 'llama3',
 * });
 * ```
 */
export class OllamaProvider extends BaseAIProvider {
  private endpoint: string;
  private model: string;

  constructor(options: OllamaProviderOptions = {}) {
    super('ollama', options);
    this.endpoint = options.endpoint ?? 'http://localhost:11434';
    this.model = options.model ?? 'llama2';
  }

  protected async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(`${this.endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
        format: 'json',
      }),
      signal: AbortSignal.timeout(this.options.timeout ?? 60000), // Longer timeout for local
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as {
      message: { content: string };
    };

    return data.message?.content ?? '';
  }
}

/**
 * Create Ollama provider
 */
export function createOllamaProvider(options?: OllamaProviderOptions): OllamaProvider {
  return new OllamaProvider(options);
}
