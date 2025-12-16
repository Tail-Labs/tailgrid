import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIQuery } from '../hooks/useAIQuery';
import type { AIProvider, AIQueryResult } from '@tailgrid/ai';
import type { TailGridColumn } from '@tailgrid/core';

describe('useAIQuery', () => {
  const mockParseQuery = vi.fn();

  const mockProvider: AIProvider = {
    parseQuery: mockParseQuery,
    type: 'openai',
  };

  const mockColumns: TailGridColumn<{ name: string; age: number }>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', dataType: 'string' },
    { id: 'age', header: 'Age', accessorKey: 'age', dataType: 'number' },
  ];

  const mockResult: AIQueryResult = {
    query: 'show users older than 30',
    confidence: 0.95,
    filters: [
      { id: 'age', operator: 'gt', value: 30 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockParseQuery.mockResolvedValue(mockResult);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
    });

    it('should provide query function', () => {
      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      expect(typeof result.current.query).toBe('function');
    });
  });

  describe('query execution', () => {
    it('should set loading state during query', async () => {
      mockParseQuery.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResult), 100))
      );

      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      act(() => {
        result.current.query('show users older than 30');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should return result on successful query', async () => {
      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      await act(async () => {
        await result.current.query('show users older than 30');
      });

      expect(result.current.result).toEqual(mockResult);
    });

    it('should call onResult callback on success', async () => {
      const onResult = vi.fn();

      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
          onResult,
        })
      );

      await act(async () => {
        await result.current.query('show users older than 30');
      });

      expect(onResult).toHaveBeenCalledWith(mockResult);
    });

    it('should set error state on failed query', async () => {
      const error = new Error('API error');
      mockParseQuery.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      await act(async () => {
        try {
          await result.current.query('invalid query');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('API error');
    });

    it('should call onError callback on failure', async () => {
      const error = new Error('API error');
      mockParseQuery.mockRejectedValue(error);
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
          onError,
        })
      );

      await act(async () => {
        try {
          await result.current.query('invalid query');
        } catch {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const error = new Error('API error');
      mockParseQuery.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      await act(async () => {
        try {
          await result.current.query('invalid query');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('API error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('query history', () => {
    it('should track query history', async () => {
      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      await act(async () => {
        await result.current.query('first query');
      });

      mockParseQuery.mockResolvedValue({
        ...mockResult,
        query: 'second query',
      });

      await act(async () => {
        await result.current.query('second query');
      });

      expect(result.current.history.length).toBe(2);
    });

    it('should track all queries in history', async () => {
      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      for (let i = 0; i < 5; i++) {
        mockParseQuery.mockResolvedValue({
          ...mockResult,
          query: `query ${i}`,
        });

        await act(async () => {
          await result.current.query(`query ${i}`);
        });
      }

      expect(result.current.history.length).toBe(5);
    });

    it('should provide clearHistory function', async () => {
      const { result } = renderHook(() =>
        useAIQuery({
          provider: mockProvider,
          columns: mockColumns,
        })
      );

      await act(async () => {
        await result.current.query('test query');
      });

      expect(result.current.history.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history.length).toBe(0);
    });
  });
});
