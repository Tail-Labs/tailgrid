import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualization } from '../hooks/useVirtualization';

// Mock @tanstack/react-virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    getVirtualItems: () => [
      { index: 0, start: 0, size: 48, key: '0' },
      { index: 1, start: 48, size: 48, key: '1' },
      { index: 2, start: 96, size: 48, key: '2' },
    ],
    getTotalSize: () => 480,
    measureElement: vi.fn(),
    scrollToIndex: vi.fn(),
  })),
}));

describe('useVirtualization', () => {
  const defaultOptions = {
    count: 100,
    estimateSize: 48,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should return virtual items', () => {
      const { result } = renderHook(() => useVirtualization(defaultOptions));

      expect(result.current.virtualItems).toBeDefined();
      expect(Array.isArray(result.current.virtualItems)).toBe(true);
    });

    it('should return total size', () => {
      const { result } = renderHook(() => useVirtualization(defaultOptions));

      expect(result.current.totalSize).toBe(480);
    });

    it('should return measureElement function', () => {
      const { result } = renderHook(() => useVirtualization(defaultOptions));

      expect(typeof result.current.measureElement).toBe('function');
    });

    it('should return containerRef', () => {
      const { result } = renderHook(() => useVirtualization(defaultOptions));

      expect(result.current.containerRef).toBeDefined();
    });
  });

  describe('scrollToIndex', () => {
    it('should provide scrollToIndex function', () => {
      const { result } = renderHook(() => useVirtualization(defaultOptions));

      expect(typeof result.current.scrollToIndex).toBe('function');
    });
  });

  describe('options', () => {
    it('should accept overscan option', () => {
      const { result } = renderHook(() =>
        useVirtualization({ ...defaultOptions, overscan: 5 })
      );

      expect(result.current.virtualItems).toBeDefined();
    });

    it('should accept getItemKey option', () => {
      const getItemKey = vi.fn((index: number) => `item-${index}`);
      const { result } = renderHook(() =>
        useVirtualization({ ...defaultOptions, getItemKey })
      );

      expect(result.current.virtualItems).toBeDefined();
    });
  });
});
