import { z } from 'zod';
import type { TailGridColumn, ColumnFilter, SortConfig } from '@tailgrid/core';

// ============================================
// PROVIDER TYPES
// ============================================

export type AIProviderType = 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface AIProviderOptions {
  /** API key (for cloud providers) */
  apiKey?: string;
  /** API endpoint */
  endpoint?: string;
  /** Model name */
  model?: string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Request timeout in ms */
  timeout?: number;
}

export interface AIProvider {
  /** Provider type */
  type: AIProviderType;
  /** Parse natural language query */
  parseQuery: (query: string, schema: ColumnSchema[]) => Promise<AIQueryResult>;
}

// ============================================
// SCHEMA TYPES
// ============================================

export interface ColumnSchema {
  /** Column ID */
  id: string;
  /** Column header/name */
  name: string;
  /** Data type */
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  /** Example values (for better AI understanding) */
  examples?: string[];
  /** Description (for AI context) */
  description?: string;
}

// ============================================
// QUERY RESULT TYPES
// ============================================

export interface AIQueryResult {
  /** Parsed filters */
  filters: ColumnFilter[];
  /** Parsed sorting */
  sorting: SortConfig[];
  /** Original query */
  query: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Error message if parsing failed */
  error?: string;
  /** Raw AI response (for debugging) */
  rawResponse?: string;
}

// ============================================
// ZOD SCHEMAS FOR AI OUTPUT VALIDATION
// ============================================

export const FilterOperatorSchema = z.enum([
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'inList',
  'isEmpty',
  'isNotEmpty',
]);

export const ColumnFilterSchema = z.object({
  id: z.string(),
  operator: FilterOperatorSchema,
  value: z.unknown(),
});

export const SortConfigSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const AIOutputSchema = z.object({
  filters: z.array(ColumnFilterSchema),
  sorting: z.array(SortConfigSchema),
  confidence: z.number().min(0).max(1),
});

export type AIOutput = z.infer<typeof AIOutputSchema>;

// ============================================
// PROMPT TYPES
// ============================================

export interface PromptContext {
  /** User's query */
  query: string;
  /** Available columns */
  columns: ColumnSchema[];
  /** Additional context */
  context?: string;
}
