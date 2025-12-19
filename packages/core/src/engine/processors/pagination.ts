export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginationInfo extends PaginationState {
  pageCount: number;
  totalRows: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
}

/**
 * Paginate data array
 */
export function paginateData<TData>(
  data: TData[],
  pagination: PaginationState
): TData[] {
  const { pageIndex, pageSize } = pagination;
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
}

/**
 * Calculate pagination info
 */
export function getPaginationInfo(
  totalRows: number,
  pagination: PaginationState
): PaginationInfo {
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.ceil(totalRows / pageSize);

  return {
    pageIndex,
    pageSize,
    pageCount,
    totalRows,
    canPreviousPage: pageIndex > 0,
    canNextPage: pageIndex < pageCount - 1,
  };
}
