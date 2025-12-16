import { useState, useCallback, useMemo } from 'react';
import type { TailGridColumn, AIQueryResult, ColumnFilter, SortConfig } from '@tailgrid/core';
import type { AIProvider, ColumnSchema } from '@tailgrid/ai';

// ============================================
// TYPES
// ============================================

export interface UseAIQueryOptions<TData> {
  /** AI provider instance */
  provider: AIProvider;
  /** Column definitions (for schema generation) */
  columns: TailGridColumn<TData>[];
  /** Callback when query result is ready */
  onResult?: (result: AIQueryResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Apply filters to grid automatically */
  autoApplyFilters?: boolean;
  /** Apply sorting to grid automatically */
  autoApplySorting?: boolean;
  /** Set column filter callback */
  setColumnFilter?: (columnId: string, value: unknown) => void;
  /** Set sorting callback */
  setSorting?: (sorting: Array<{ id: string; desc: boolean }>) => void;
}

export interface UseAIQueryReturn {
  /** Execute AI query */
  query: (input: string) => Promise<AIQueryResult>;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Last result */
  result: AIQueryResult | null;
  /** Clear error */
  clearError: () => void;
  /** Clear result */
  clearResult: () => void;
  /** Query history */
  history: Array<{ query: string; result: AIQueryResult; timestamp: Date }>;
  /** Clear history */
  clearHistory: () => void;
}

// ============================================
// HOOK
// ============================================

/**
 * useAIQuery - Hook for AI-powered natural language queries
 *
 * Converts natural language to filter/sort operations using an AI provider.
 *
 * @example
 * ```tsx
 * const { query, loading, error, result } = useAIQuery({
 *   provider: openaiProvider,
 *   columns,
 *   onResult: (result) => {
 *     // Apply filters manually if autoApplyFilters is false
 *     result.filters.forEach(f => setColumnFilter(f.id, f.value));
 *   },
 * });
 *
 * // Execute query
 * await query('show customers in California with revenue > 10k');
 * ```
 */
export function useAIQuery<TData>({
  provider,
  columns,
  onResult,
  onError,
  autoApplyFilters = true,
  autoApplySorting = true,
  setColumnFilter,
  setSorting,
}: UseAIQueryOptions<TData>): UseAIQueryReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIQueryResult | null>(null);
  const [history, setHistory] = useState<Array<{ query: string; result: AIQueryResult; timestamp: Date }>>([]);

  // Convert columns to AI schema
  const schema = useMemo<ColumnSchema[]>(
    () =>
      columns.map((col) => ({
        id: col.id,
        name: col.header,
        type: col.dataType || 'string',
        description: col.header,
      })),
    [columns]
  );

  // Execute query
  const query = useCallback(
    async (input: string): Promise<AIQueryResult> => {
      if (!input.trim()) {
        throw new Error('Query cannot be empty');
      }

      setLoading(true);
      setError(null);

      try {
        const queryResult = await provider.parseQuery(input, schema);

        // Auto-apply filters
        if (autoApplyFilters && setColumnFilter && queryResult.filters) {
          queryResult.filters.forEach((filter: ColumnFilter) => {
            setColumnFilter(filter.id, filter.value);
          });
        }

        // Auto-apply sorting
        if (autoApplySorting && setSorting && queryResult.sorting) {
          setSorting(
            queryResult.sorting.map((s: SortConfig) => ({
              id: s.id,
              desc: s.desc,
            }))
          );
        }

        // Update state
        setResult(queryResult);
        setHistory((prev) => [
          ...prev,
          { query: input, result: queryResult, timestamp: new Date() },
        ]);

        // Callback
        onResult?.(queryResult);

        return queryResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'AI query failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, schema, autoApplyFilters, autoApplySorting, setColumnFilter, setSorting, onResult, onError]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear result
  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    query,
    loading,
    error,
    result,
    clearError,
    clearResult,
    history,
    clearHistory,
  };
}

export default useAIQuery;
