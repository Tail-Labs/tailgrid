import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  RemoteRequestParams,
  SortingState,
  ColumnFilter,
} from '@tailgrid/core';

// ============================================
// TYPES
// ============================================

export interface UseRemoteDataOptions<TData> {
  /** API URL (required) */
  url: string;
  /** Page size (default: 10) */
  pageSize?: number;
  /** HTTP method (default: 'GET') */
  method?: 'GET' | 'POST';
  /** Additional headers */
  headers?: Record<string, string>;
  /** Key in response containing data array (default: 'data') */
  responseDataKey?: string;
  /** Key in response containing total count (default: 'total') */
  responseTotalKey?: string;
  /** Query parameter name for page (default: 'page') */
  pageParam?: string;
  /** Query parameter name for page size (default: 'pageSize') */
  pageSizeParam?: string;
  /** Query parameter name for sorting (default: 'sort') */
  sortParam?: string;
  /** Query parameter name for filters (default: 'filter') */
  filterParam?: string;
  /** Query parameter name for search (default: 'search') */
  searchParam?: string;
  /** Transform the request before sending */
  transformRequest?: (params: RemoteRequestParams) => Record<string, unknown>;
  /** Transform the response after receiving */
  transformResponse?: <T>(response: unknown) => { data: T[]; total: number };
  /** Debounce delay for filtering/search in ms (default: 300) */
  debounceMs?: number;
  /** Initial data (optional) */
  initialData?: TData[];
  /** Called when data changes */
  onDataChange?: (data: TData[], total: number) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export interface UseRemoteDataReturn<TData> {
  /** Current data */
  data: TData[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Total rows on server */
  totalRows: number;
  /** Current page (1-based for display) */
  page: number;
  /** Page size */
  pageSize: number;
  /** Set page */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Refetch data */
  refetch: () => void;
  /** Set sorting (triggers refetch) */
  setSorting: (sorting: SortingState) => void;
  /** Set filters (triggers refetch) */
  setFilters: (filters: ColumnFilter[]) => void;
  /** Set global filter (triggers refetch) */
  setGlobalFilter: (filter: string) => void;
  /** Current sorting state */
  sorting: SortingState;
  /** Current filters */
  filters: ColumnFilter[];
  /** Current global filter */
  globalFilter: string;
}

// ============================================
// HOOK
// ============================================

/**
 * useRemoteData - Simple hook for fetching paginated data from a URL
 *
 * @example
 * ```tsx
 * const { data, loading, page, setPage, totalRows } = useRemoteData({
 *   url: 'https://api.example.com/users',
 *   pageSize: 20,
 * });
 * ```
 */
export function useRemoteData<TData>(options: UseRemoteDataOptions<TData>): UseRemoteDataReturn<TData> {
  const {
    url,
    pageSize: initialPageSize = 10,
    method = 'GET',
    headers,
    responseDataKey = 'data',
    responseTotalKey = 'total',
    pageParam = 'page',
    pageSizeParam = 'pageSize',
    sortParam = 'sort',
    filterParam = 'filter',
    searchParam = 'search',
    transformRequest,
    transformResponse,
    debounceMs = 300,
    initialData = [],
    onDataChange,
    onError,
  } = options;

  // State
  const [data, setData] = useState<TData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [sorting, setSortingState] = useState<SortingState>([]);
  const [filters, setFiltersState] = useState<ColumnFilter[]>([]);
  const [globalFilter, setGlobalFilterState] = useState('');

  // Store refs for callbacks to avoid infinite loops
  const transformRequestRef = useRef(transformRequest);
  const transformResponseRef = useRef(transformResponse);
  const onDataChangeRef = useRef(onDataChange);
  const onErrorRef = useRef(onError);
  const headersRef = useRef(headers);

  // Store current state in refs for stable fetchData
  const pageRef = useRef(page);
  const pageSizeRef = useRef(pageSize);
  const sortingRef = useRef(sorting);
  const filtersRef = useRef(filters);
  const globalFilterRef = useRef(globalFilter);

  // Update refs when state changes
  pageRef.current = page;
  pageSizeRef.current = pageSize;
  sortingRef.current = sorting;
  filtersRef.current = filters;
  globalFilterRef.current = globalFilter;

  // Update callback refs when props change
  useEffect(() => {
    transformRequestRef.current = transformRequest;
    transformResponseRef.current = transformResponse;
    onDataChangeRef.current = onDataChange;
    onErrorRef.current = onError;
    headersRef.current = headers;
  });

  // Debounce ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Build URL with query params
  const buildUrl = useCallback(
    (params: RemoteRequestParams): string => {
      const urlObj = new URL(url, window.location.origin);

      // Add pagination
      urlObj.searchParams.set(pageParam, String(params.page));
      urlObj.searchParams.set(pageSizeParam, String(params.pageSize));

      // Add sorting
      if (params.sorting && params.sorting.length > 0) {
        const sortValue = params.sorting
          .map((s) => `${s.desc ? '-' : ''}${s.id}`)
          .join(',');
        urlObj.searchParams.set(sortParam, sortValue);
      }

      // Add filters
      if (params.filters && params.filters.length > 0) {
        urlObj.searchParams.set(filterParam, JSON.stringify(params.filters));
      }

      // Add global filter
      if (params.globalFilter) {
        urlObj.searchParams.set(searchParam, params.globalFilter);
      }

      return urlObj.toString();
    },
    [url, pageParam, pageSizeParam, sortParam, filterParam, searchParam]
  );

  // Fetch data - stable function that reads from refs
  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const params: RemoteRequestParams = {
      page: pageRef.current,
      pageSize: pageSizeRef.current,
      sorting: sortingRef.current,
      filters: filtersRef.current,
      globalFilter: globalFilterRef.current,
    };

    try {
      const fetchUrl = buildUrl(params);
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headersRef.current,
        },
        signal: abortControllerRef.current.signal,
      };

      // Handle POST method
      if (method === 'POST') {
        const body = transformRequestRef.current ? transformRequestRef.current(params) : params;
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(fetchUrl, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // Parse response
      let responseData: TData[];
      let responseTotal: number;

      if (transformResponseRef.current) {
        const transformed = transformResponseRef.current<TData>(json);
        responseData = transformed.data;
        responseTotal = transformed.total;
      } else {
        // Default parsing: look for data and total in response
        responseData = getNestedValue(json, responseDataKey) as TData[] || [];
        responseTotal = getNestedValue(json, responseTotalKey) as number || responseData.length;
      }

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(responseData);
        setTotalRows(responseTotal);
        onDataChangeRef.current?.(responseData, responseTotal);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      if (isMountedRef.current) {
        setError(message);
        onErrorRef.current?.(err instanceof Error ? err : new Error(message));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, method, buildUrl, responseDataKey, responseTotalKey]);

  // Use a version counter to trigger refetch
  const [version, setVersion] = useState(0);

  // Trigger fetch when version changes (includes initial mount)
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  // Increment version when any param changes to trigger refetch
  // Use refs to track previous values and only increment on actual changes
  const prevParamsRef = useRef({ page, pageSize, sorting, filters, globalFilter });

  useEffect(() => {
    const prev = prevParamsRef.current;
    const sortingChanged = JSON.stringify(prev.sorting) !== JSON.stringify(sorting);
    const filtersChanged = JSON.stringify(prev.filters) !== JSON.stringify(filters);
    const changed =
      prev.page !== page ||
      prev.pageSize !== pageSize ||
      sortingChanged ||
      filtersChanged ||
      prev.globalFilter !== globalFilter;

    if (changed) {
      prevParamsRef.current = { page, pageSize, sorting, filters, globalFilter };
      setVersion((v) => v + 1);
    }
  }, [page, pageSize, sorting, filters, globalFilter]);

  // Debounced setters for filters
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1); // Reset to first page
  }, []);

  const setSorting = useCallback((newSorting: SortingState) => {
    setSortingState(newSorting);
    setPageState(1); // Reset to first page
  }, []);

  const setFilters = useCallback(
    (newFilters: ColumnFilter[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setFiltersState(newFilters);
        setPageState(1); // Reset to first page
      }, debounceMs);
    },
    [debounceMs]
  );

  const setGlobalFilter = useCallback(
    (newFilter: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setGlobalFilterState(newFilter);
        setPageState(1); // Reset to first page
      }, debounceMs);
    },
    [debounceMs]
  );

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    totalRows,
    page,
    pageSize,
    setPage,
    setPageSize,
    refetch: fetchData,
    setSorting,
    setFilters,
    setGlobalFilter,
    sorting,
    filters,
    globalFilter,
  };
}

// Helper to get nested value from object (supports 'data.items' syntax)
function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export default useRemoteData;
