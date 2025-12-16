import type { ColumnSchema, PromptContext } from './types';

/**
 * Generate system prompt for AI query parsing
 */
export function generateSystemPrompt(columns: ColumnSchema[]): string {
  const columnDescriptions = columns
    .map((col) => {
      let desc = `- "${col.id}" (${col.type}): ${col.name}`;
      if (col.description) {
        desc += ` - ${col.description}`;
      }
      if (col.examples && col.examples.length > 0) {
        desc += ` (examples: ${col.examples.slice(0, 3).join(', ')})`;
      }
      return desc;
    })
    .join('\n');

  return `You are a data grid query parser. Your job is to convert natural language queries into structured filter and sort operations.

Available columns:
${columnDescriptions}

Available filter operators:
- equals: Exact match
- notEquals: Not equal
- contains: Contains substring (strings only)
- notContains: Does not contain (strings only)
- startsWith: Starts with (strings only)
- endsWith: Ends with (strings only)
- gt: Greater than (numbers/dates)
- gte: Greater than or equal (numbers/dates)
- lt: Less than (numbers/dates)
- lte: Less than or equal (numbers/dates)
- between: Between two values (numbers/dates)
- inList: Value in list
- isEmpty: Value is empty/null
- isNotEmpty: Value is not empty/null

Respond with ONLY valid JSON in this exact format:
{
  "filters": [
    { "id": "column_id", "operator": "equals", "value": "some value" }
  ],
  "sorting": [
    { "id": "column_id", "desc": false }
  ],
  "confidence": 0.95
}

Rules:
1. Only use columns that exist in the schema
2. Use appropriate operators for each data type
3. For dates, use ISO format (YYYY-MM-DD)
4. For numbers, use numeric values (not strings)
5. Confidence should be 0-1 based on how certain you are about the interpretation
6. If the query is unclear or cannot be parsed, return empty arrays with low confidence
7. Do not include any explanation, only the JSON object`;
}

/**
 * Generate user prompt from query
 */
export function generateUserPrompt(query: string): string {
  return `Parse this query: "${query}"`;
}

/**
 * Generate full prompt context
 */
export function generatePromptContext(context: PromptContext): {
  system: string;
  user: string;
} {
  return {
    system: generateSystemPrompt(context.columns),
    user: generateUserPrompt(context.query),
  };
}
