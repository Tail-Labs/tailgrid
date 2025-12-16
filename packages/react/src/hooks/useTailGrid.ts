import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type PaginationState,
  type ColumnDef,
} from '@tanstack/react-table';

import type {
  TailGridOptions,
  TailGridColumn,
  FilterState,
  ColumnFilter,
  PaginationInfo,
  RowSelection,
} from '@tailgrid/core';

export interface UseTailGridReturn<TData> {
  /** TanStack React Table instance */
  table: ReturnType<typeof useReactTable<TData>>;

  // Sorting
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  toggleSort: (columnId: string) => void;
  clearSorting: () => void;

  // Filtering
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  setColumnFilter: (columnId: string, value: unknown) => void;
  setGlobalFilter: (value: string) => void;
  clearFilters: () => void;

  // Pagination
  pagination: PaginationState;
  paginationInfo: PaginationInfo;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;

  // Selection
  rowSelection: RowSelectionState;
  selectedRows: TData[];
  toggleRowSelection: (rowId: string) => void;
  toggleAllRowsSelection: () => void;
  clearSelection: () => void;

  // Data
  rows: TData[];
}

/**
 * React hook for TailGrid
 *
 * @example
 * ```tsx
 * const { table, rows, sorting, setSorting } = useTailGrid({
 *   data: users,
 *   columns: [
 *     { id: 'name', header: 'Name', accessorKey: 'name' },
 *     { id: 'email', header: 'Email', accessorKey: 'email' },
 *   ],
 *   enableSorting: true,
 * });
 * ```
 */
export function useTailGrid<TData>(
  options: TailGridOptions<TData>
): UseTailGridReturn<TData> {
  // State
  const [sorting, setSorting] = useState<SortingState>(
    options.initialSorting ?? []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: options.initialPagination?.pageIndex ?? 0,
    pageSize: options.initialPagination?.pageSize ?? 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    options.initialRowSelection ?? {}
  );

  // Convert columns
  const columns = useMemo<ColumnDef<TData>[]>(
    () =>
      options.columns.map((col) => ({
        id: col.id,
        header: col.header,
        accessorKey: col.accessorKey,
        accessorFn: col.accessorFn,
        enableSorting: col.enableSorting ?? options.enableSorting ?? true,
        enableColumnFilter: col.enableFiltering ?? options.enableFiltering ?? true,
        size: col.width,
        minSize: col.minWidth ?? 50,
        maxSize: col.maxWidth ?? 500,
      })),
    [options.columns, options.enableSorting, options.enableFiltering]
  );

  // Create table
  const table = useReactTable({
    data: options.data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      options.onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      options.onPaginationChange?.(newPagination);
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      options.onRowSelectionChange?.(newSelection);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: options.enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: options.enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: options.enablePagination ? getPaginationRowModel() : undefined,
    enableRowSelection: options.enableRowSelection,
    enableMultiRowSelection: options.enableMultiRowSelection ?? true,
    getRowId: options.getRowId,
  });

  // Sorting helpers
  const toggleSort = useCallback(
    (columnId: string) => {
      const column = table.getColumn(columnId);
      column?.toggleSorting();
    },
    [table]
  );

  const clearSorting = useCallback(() => {
    setSorting([]);
    table.resetSorting();
  }, [table]);

  // Filter helpers
  const setColumnFilterValue = useCallback(
    (columnId: string, value: unknown) => {
      const column = table.getColumn(columnId);
      column?.setFilterValue(value);
    },
    [table]
  );

  const clearFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter('');
    table.resetColumnFilters();
    table.resetGlobalFilter();
  }, [table]);

  // Pagination helpers
  const setPageIndex = useCallback(
    (index: number) => table.setPageIndex(index),
    [table]
  );

  const setPageSize = useCallback(
    (size: number) => table.setPageSize(size),
    [table]
  );

  const nextPage = useCallback(() => table.nextPage(), [table]);
  const previousPage = useCallback(() => table.previousPage(), [table]);
  const firstPage = useCallback(() => table.firstPage(), [table]);
  const lastPage = useCallback(() => table.lastPage(), [table]);

  const paginationInfo = useMemo<PaginationInfo>(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      pageCount: table.getPageCount(),
      totalRows: table.getFilteredRowModel().rows.length,
      canPreviousPage: table.getCanPreviousPage(),
      canNextPage: table.getCanNextPage(),
    }),
    [pagination, table]
  );

  // Selection helpers
  const toggleRowSelection = useCallback(
    (rowId: string) => {
      const row = table.getRow(rowId);
      row?.toggleSelected();
    },
    [table]
  );

  const toggleAllRowsSelection = useCallback(
    () => table.toggleAllRowsSelected(),
    [table]
  );

  const clearSelection = useCallback(() => {
    setRowSelection({});
    table.resetRowSelection();
  }, [table]);

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original),
    [table, rowSelection]
  );

  // Current page rows
  const rows = useMemo(
    () => table.getRowModel().rows.map((row) => row.original),
    [table, pagination, sorting, columnFilters, globalFilter]
  );

  return {
    table,

    // Sorting
    sorting,
    setSorting,
    toggleSort,
    clearSorting,

    // Filtering
    columnFilters,
    globalFilter,
    setColumnFilter: setColumnFilterValue,
    setGlobalFilter,
    clearFilters,

    // Pagination
    pagination,
    paginationInfo,
    setPageIndex,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,

    // Selection
    rowSelection,
    selectedRows,
    toggleRowSelection,
    toggleAllRowsSelection,
    clearSelection,

    // Data
    rows,
  };
}
