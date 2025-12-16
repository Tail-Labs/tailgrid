import { BaseAIProvider } from './base';
import type { AIProviderOptions } from '../types';

export interface OpenAIProviderOptions extends AIProviderOptions {
  /** OpenAI API key */
  apiKey: string;
  /** Model to use (default: gpt-4o-mini) */
  model?: string;
  /** Temperature (default: 0) */
  temperature?: number;
}

/**
 * OpenAI provider for AI query parsing
 *
 * @example
 * ```ts
 * const provider = new OpenAIProvider({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   model: 'gpt-4o-mini',
 * });
 * ```
 */
export class OpenAIProvider extends BaseAIProvider {
  private apiKey: string;
  private model: string;
  private temperature: number;

  constructor(options: OpenAIProviderOptions) {
    super('openai', options);
    this.apiKey = options.apiKey;
    this.model = options.model ?? 'gpt-4o-mini';
    this.temperature = options.temperature ?? 0;
  }

  protected async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const endpoint = this.options.endpoint ?? 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...this.options.headers,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: this.temperature,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(this.options.timeout ?? 30000),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    return data.choices[0]?.message?.content ?? '';
  }
}

/**
 * Create OpenAI provider
 */
export function createOpenAIProvider(options: OpenAIProviderOptions): OpenAIProvider {
  return new OpenAIProvider(options);
}
