import { BaseAIProvider } from './base';
import type { AIProviderOptions } from '../types';

export interface AnthropicProviderOptions extends AIProviderOptions {
  /** Anthropic API key */
  apiKey: string;
  /** Model to use (default: claude-3-haiku-20240307) */
  model?: string;
  /** Max tokens (default: 1024) */
  maxTokens?: number;
}

/**
 * Anthropic (Claude) provider for AI query parsing
 *
 * @example
 * ```ts
 * const provider = new AnthropicProvider({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   model: 'claude-3-haiku-20240307',
 * });
 * ```
 */
export class AnthropicProvider extends BaseAIProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;

  constructor(options: AnthropicProviderOptions) {
    super('anthropic', options);
    this.apiKey = options.apiKey;
    this.model = options.model ?? 'claude-3-haiku-20240307';
    this.maxTokens = options.maxTokens ?? 1024;
  }

  protected async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const endpoint = this.options.endpoint ?? 'https://api.anthropic.com/v1/messages';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        ...this.options.headers,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: AbortSignal.timeout(this.options.timeout ?? 30000),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };

    const textContent = data.content.find((c) => c.type === 'text');
    return textContent?.text ?? '';
  }
}

/**
 * Create Anthropic provider
 */
export function createAnthropicProvider(options: AnthropicProviderOptions): AnthropicProvider {
  return new AnthropicProvider(options);
}
