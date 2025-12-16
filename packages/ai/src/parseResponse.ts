import { AIOutputSchema, type AIQueryResult, type AIOutput } from './types';

/**
 * Parse and validate AI response
 */
export function parseAIResponse(
  response: string,
  query: string
): AIQueryResult {
  try {
    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        filters: [],
        sorting: [],
        query,
        confidence: 0,
        error: 'No JSON found in response',
        rawResponse: response,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as unknown;

    // Validate with Zod
    const validated = AIOutputSchema.safeParse(parsed);

    if (!validated.success) {
      return {
        filters: [],
        sorting: [],
        query,
        confidence: 0,
        error: `Validation failed: ${validated.error.message}`,
        rawResponse: response,
      };
    }

    const output: AIOutput = validated.data;

    return {
      filters: output.filters.map((f) => ({
        id: f.id,
        operator: f.operator,
        value: f.value,
      })),
      sorting: output.sorting.map((s) => ({
        id: s.id,
        desc: s.desc,
      })),
      query,
      confidence: output.confidence,
      rawResponse: response,
    };
  } catch (error) {
    return {
      filters: [],
      sorting: [],
      query,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Failed to parse response',
      rawResponse: response,
    };
  }
}
