import { useRef, useCallback, useMemo } from 'react';
import { useVirtualizer, type VirtualItem, type Virtualizer } from '@tanstack/react-virtual';

// ============================================
// TYPES
// ============================================

export interface UseVirtualizationOptions {
  /** Total count of items */
  count: number;
  /** Estimated size of each row in pixels */
  estimateSize?: number;
  /** Overscan count (number of items to render outside visible area) */
  overscan?: number;
  /** Enable horizontal virtualization */
  horizontal?: boolean;
  /** Get item key */
  getItemKey?: (index: number) => string | number;
  /** Callback when scroll reaches near end (for infinite scroll) */
  onLoadMore?: () => void;
  /** Threshold for triggering onLoadMore (in pixels from end) */
  loadMoreThreshold?: number;
  /** Whether more data is being loaded */
  isLoadingMore?: boolean;
  /** Whether there are more items to load */
  hasMore?: boolean;
}

export interface UseVirtualizationReturn {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Virtual items to render */
  virtualItems: VirtualItem[];
  /** Total size of all items */
  totalSize: number;
  /** Virtualizer instance */
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  /** Scroll to a specific index */
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  /** Scroll to a specific offset */
  scrollToOffset: (offset: number) => void;
  /** Check if a row is visible */
  isItemVisible: (index: number) => boolean;
  /** Measure an element (call when row height changes) */
  measureElement: (element: Element | null) => void;
}

// ============================================
// HOOK
// ============================================

/**
 * useVirtualization - Hook for virtual scrolling with infinite load support
 *
 * Uses @tanstack/react-virtual for efficient rendering of large lists.
 *
 * @example
 * ```tsx
 * const {
 *   containerRef,
 *   virtualItems,
 *   totalSize,
 *   scrollToIndex,
 * } = useVirtualization({
 *   count: data.length,
 *   estimateSize: 48,
 *   overscan: 5,
 *   onLoadMore: fetchNextPage,
 *   hasMore: hasNextPage,
 *   isLoadingMore: isFetching,
 * });
 * ```
 */
export function useVirtualization({
  count,
  estimateSize = 48,
  overscan = 5,
  horizontal = false,
  getItemKey,
  onLoadMore,
  loadMoreThreshold = 200,
  isLoadingMore = false,
  hasMore = false,
}: UseVirtualizationOptions): UseVirtualizationReturn {
  const containerRef = useRef<HTMLDivElement>(null);

  // Create virtualizer
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal,
    getItemKey,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Infinite scroll detection
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !onLoadMore || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < loadMoreThreshold) {
      onLoadMore();
    }
  }, [onLoadMore, isLoadingMore, hasMore, loadMoreThreshold]);

  // Attach scroll listener
  useMemo(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, onLoadMore]);

  // Scroll to index
  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
      virtualizer.scrollToIndex(index, options);
    },
    [virtualizer]
  );

  // Scroll to offset
  const scrollToOffset = useCallback(
    (offset: number) => {
      virtualizer.scrollToOffset(offset);
    },
    [virtualizer]
  );

  // Check if item is visible
  const isItemVisible = useCallback(
    (index: number): boolean => {
      const range = virtualizer.range;
      if (!range) return false;
      return index >= range.startIndex && index <= range.endIndex;
    },
    [virtualizer]
  );

  // Measure element for dynamic heights
  const measureElement = useCallback(
    (element: Element | null) => {
      if (element) {
        virtualizer.measureElement(element);
      }
    },
    [virtualizer]
  );

  return {
    containerRef,
    virtualItems,
    totalSize,
    virtualizer,
    scrollToIndex,
    scrollToOffset,
    isItemVisible,
    measureElement,
  };
}

export default useVirtualization;
