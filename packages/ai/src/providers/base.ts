import type { AIProvider, AIProviderOptions, AIProviderType, ColumnSchema, AIQueryResult } from '../types';
import { generatePromptContext } from '../generatePrompt';
import { parseAIResponse } from '../parseResponse';

/**
 * Base class for AI providers
 */
export abstract class BaseAIProvider implements AIProvider {
  type: AIProviderType;
  protected options: AIProviderOptions;

  constructor(type: AIProviderType, options: AIProviderOptions = {}) {
    this.type = type;
    this.options = {
      timeout: 30000,
      ...options,
    };
  }

  /**
   * Parse a natural language query into filters and sorting
   */
  async parseQuery(query: string, schema: ColumnSchema[]): Promise<AIQueryResult> {
    const { system, user } = generatePromptContext({ query, columns: schema });

    try {
      const response = await this.callAPI(system, user);
      return parseAIResponse(response, query);
    } catch (error) {
      return {
        filters: [],
        sorting: [],
        query,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Make API call to the AI provider
   * Must be implemented by each provider
   */
  protected abstract callAPI(systemPrompt: string, userPrompt: string): Promise<string>;
}
