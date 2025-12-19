import { useState, useCallback, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type {
  SortingState,
  ColumnFilter,
} from '@tailgrid/core';

// ============================================
// TYPES
// ============================================

export interface RemoteGridConfig<TData> {
  /** Unique key for this query (used for caching) */
  queryKey: string;
  /** Fetch function - receives params, returns { data, total } */
  fetchFn: (params: FetchParams) => Promise<FetchResult<TData>>;
  /** Initial page size (default: 10) */
  pageSize?: number;
  /** Stale time in ms (default: 30000 - 30 seconds) */
  staleTime?: number;
  /** Enable query (default: true) */
  enabled?: boolean;
}

export interface FetchParams {
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: ColumnFilter[];
  globalFilter: string;
}

export interface FetchResult<TData> {
  data: TData[];
  total: number;
}

export interface UseTailGridQueryReturn<TData> {
  /** Current page data */
  data: TData[];
  /** Is loading (first load) */
  isLoading: boolean;
  /** Is fetching (includes background refetch) */
  isFetching: boolean;
  /** Error if any */
  error: Error | null;
  /** Total rows on server */
  totalRows: number;
  /** Total pages */
  totalPages: number;
  /** Current page (1-based) */
  page: number;
  /** Page size */
  pageSize: number;
  /** Can go to previous page */
  canPreviousPage: boolean;
  /** Can go to next page */
  canNextPage: boolean;
  /** Go to specific page */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Current sorting */
  sorting: SortingState;
  /** Set sorting */
  setSorting: (sorting: SortingState) => void;
  /** Current filters */
  filters: ColumnFilter[];
  /** Set filters */
  setFilters: (filters: ColumnFilter[]) => void;
  /** Current global filter */
  globalFilter: string;
  /** Set global filter */
  setGlobalFilter: (filter: string) => void;
  /** Refetch data */
  refetch: () => void;
}

// ============================================
// HOOK
// ============================================

/**
 * useTailGridQuery - TanStack Query-powered remote data hook for TailGrid
 *
 * This hook provides a seamless integration with TanStack Query for server-side
 * pagination, sorting, and filtering with automatic caching and background updates.
 *
 * @example
 * ```tsx
 * // Define your fetch function
 * const fetchUsers = async (params: FetchParams) => {
 *   const res = await fetch(`/api/users?page=${params.page}&limit=${params.pageSize}`);
 *   const json = await res.json();
 *   return { data: json.users, total: json.total };
 * };
 *
 * // Use in component
 * const {
 *   data,
 *   isLoading,
 *   page,
 *   setPage,
 *   totalPages,
 *   sorting,
 *   setSorting,
 * } = useTailGridQuery({
 *   queryKey: 'users',
 *   fetchFn: fetchUsers,
 *   pageSize: 20,
 * });
 *
 * // Pass to TailGrid
 * <TailGrid
 *   data={data}
 *   columns={columns}
 *   loading={isLoading}
 *   enableSorting
 *   onSortingChange={setSorting}
 * />
 * ```
 */
export function useTailGridQuery<TData>({
  queryKey,
  fetchFn,
  pageSize: initialPageSize = 10,
  staleTime = 30000,
  enabled = true,
}: RemoteGridConfig<TData>): UseTailGridQueryReturn<TData> {
  // Local state for pagination, sorting, filtering
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [sorting, setSortingState] = useState<SortingState>([]);
  const [filters, setFiltersState] = useState<ColumnFilter[]>([]);
  const [globalFilter, setGlobalFilterState] = useState('');

  // Build query key with all params
  const fullQueryKey = useMemo(
    () => [queryKey, { page, pageSize, sorting, filters, globalFilter }],
    [queryKey, page, pageSize, sorting, filters, globalFilter]
  );

  // Use TanStack Query
  const {
    data: queryData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => fetchFn({ page, pageSize, sorting, filters, globalFilter }),
    staleTime,
    enabled,
    placeholderData: keepPreviousData, // Keep previous data while fetching new
  });

  // Extract data and total from query result
  const data = queryData?.data ?? [];
  const totalRows = queryData?.total ?? 0;
  const totalPages = Math.ceil(totalRows / pageSize);

  // Pagination helpers
  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1); // Reset to first page
  }, []);

  const nextPage = useCallback(() => {
    if (canNextPage) {
      setPageState((p) => p + 1);
    }
  }, [canNextPage]);

  const previousPage = useCallback(() => {
    if (canPreviousPage) {
      setPageState((p) => p - 1);
    }
  }, [canPreviousPage]);

  const firstPage = useCallback(() => {
    setPageState(1);
  }, []);

  const lastPage = useCallback(() => {
    setPageState(totalPages);
  }, [totalPages]);

  // Sorting/filtering setters that reset to page 1
  const setSorting = useCallback((newSorting: SortingState) => {
    setSortingState(newSorting);
    setPageState(1);
  }, []);

  const setFilters = useCallback((newFilters: ColumnFilter[]) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);

  const setGlobalFilter = useCallback((newFilter: string) => {
    setGlobalFilterState(newFilter);
    setPageState(1);
  }, []);

  return {
    data,
    isLoading,
    isFetching,
    error: error as Error | null,
    totalRows,
    totalPages,
    page,
    pageSize,
    canPreviousPage,
    canNextPage,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    sorting,
    setSorting,
    filters,
    setFilters,
    globalFilter,
    setGlobalFilter,
    refetch,
  };
}

// ============================================
// HELPER: Create fetch function from URL config
// ============================================

export interface UrlFetchConfig {
  /** Base URL */
  url: string;
  /** HTTP method (default: 'GET') */
  method?: 'GET' | 'POST';
  /** Additional headers */
  headers?: Record<string, string>;
  /** Query param names */
  params?: {
    page?: string;
    pageSize?: string;
    sort?: string;
    filter?: string;
    search?: string;
  };
  /** Response field names */
  response?: {
    dataKey?: string;
    totalKey?: string;
  };
}

/**
 * Helper to create a fetch function from URL configuration
 *
 * @example
 * ```tsx
 * const fetchUsers = createFetchFn<User>({
 *   url: 'https://api.example.com/users',
 *   params: { page: '_page', pageSize: '_limit' },
 *   response: { dataKey: 'results', totalKey: 'count' },
 * });
 *
 * const grid = useTailGridQuery({
 *   queryKey: 'users',
 *   fetchFn: fetchUsers,
 * });
 * ```
 */
export function createFetchFn<TData>(config: UrlFetchConfig) {
  const {
    url,
    method = 'GET',
    headers = {},
    params = {},
    response = {},
  } = config;

  const {
    page: pageParam = 'page',
    pageSize: pageSizeParam = 'pageSize',
    sort: sortParam = 'sort',
    filter: filterParam = 'filter',
    search: searchParam = 'search',
  } = params;

  const { dataKey = 'data', totalKey = 'total' } = response;

  return async (fetchParams: FetchParams): Promise<FetchResult<TData>> => {
    const urlObj = new URL(url);

    // Add pagination params
    urlObj.searchParams.set(pageParam, String(fetchParams.page));
    urlObj.searchParams.set(pageSizeParam, String(fetchParams.pageSize));

    // Add sorting
    if (fetchParams.sorting.length > 0) {
      const sortValue = fetchParams.sorting
        .map((s) => `${s.desc ? '-' : ''}${s.id}`)
        .join(',');
      urlObj.searchParams.set(sortParam, sortValue);
    }

    // Add filters
    if (fetchParams.filters.length > 0) {
      urlObj.searchParams.set(filterParam, JSON.stringify(fetchParams.filters));
    }

    // Add global filter
    if (fetchParams.globalFilter) {
      urlObj.searchParams.set(searchParam, fetchParams.globalFilter);
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (method === 'POST') {
      fetchOptions.body = JSON.stringify(fetchParams);
    }

    const res = await fetch(urlObj.toString(), fetchOptions);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();

    // Extract data and total from response
    const data = getNestedValue(json, dataKey) as TData[] ?? [];
    const total = getNestedValue(json, totalKey) as number ?? data.length;

    return { data, total };
  };
}

// Helper to get nested value from object
function getNestedValue(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export default useTailGridQuery;
