import { BaseAIProvider } from './base';
import type { AIProviderOptions } from '../types';

export interface CustomProviderOptions extends AIProviderOptions {
  /** Custom API endpoint (required) */
  endpoint: string;
  /** Custom request transformer */
  transformRequest?: (systemPrompt: string, userPrompt: string) => unknown;
  /** Custom response transformer */
  transformResponse?: (response: unknown) => string;
}

/**
 * Custom provider for any AI API
 *
 * @example
 * ```ts
 * const provider = new CustomProvider({
 *   endpoint: 'https://my-api.com/ai',
 *   headers: { 'Authorization': 'Bearer xxx' },
 *   transformRequest: (system, user) => ({
 *     prompt: `${system}\n\nUser: ${user}`,
 *   }),
 *   transformResponse: (res) => res.output,
 * });
 * ```
 */
export class CustomProvider extends BaseAIProvider {
  private endpoint: string;
  private transformRequest: (system: string, user: string) => unknown;
  private transformResponse: (response: unknown) => string;

  constructor(options: CustomProviderOptions) {
    super('custom', options);
    this.endpoint = options.endpoint;
    this.transformRequest = options.transformRequest ?? this.defaultTransformRequest;
    this.transformResponse = options.transformResponse ?? this.defaultTransformResponse;
  }

  private defaultTransformRequest(systemPrompt: string, userPrompt: string): unknown {
    return {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    };
  }

  private defaultTransformResponse(response: unknown): string {
    if (typeof response === 'string') {
      return response;
    }
    // Try common response formats
    const res = response as Record<string, unknown>;
    if (typeof res.content === 'string') return res.content;
    if (typeof res.text === 'string') return res.text;
    if (typeof res.output === 'string') return res.output;
    if (typeof res.response === 'string') return res.response;
    if (Array.isArray(res.choices) && res.choices[0]) {
      const choice = res.choices[0] as Record<string, unknown>;
      if (typeof choice.text === 'string') return choice.text;
      if (typeof choice.message === 'object' && choice.message) {
        const msg = choice.message as Record<string, unknown>;
        if (typeof msg.content === 'string') return msg.content;
      }
    }
    return JSON.stringify(response);
  }

  protected async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const body = this.transformRequest(systemPrompt, userPrompt);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.options.timeout ?? 30000),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return this.transformResponse(data);
  }
}

/**
 * Create custom provider
 */
export function createCustomProvider(options: CustomProviderOptions): CustomProvider {
  return new CustomProvider(options);
}
