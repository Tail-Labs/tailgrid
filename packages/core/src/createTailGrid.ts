import {
  createTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type Table,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState as TanStackPaginationState,
  type RowSelectionState,
} from '@tanstack/table-core';

import type {
  TailGridOptions,
  TailGridInstance,
  TailGridColumn,
  FilterState,
  ColumnFilter,
  PaginationState,
  PaginationInfo,
  RowSelection,
  SortConfig,
} from './types';

/**
 * Create a TailGrid instance
 *
 * @example
 * ```ts
 * const grid = createTailGrid({
 *   data: users,
 *   columns: [
 *     { id: 'name', header: 'Name', accessorKey: 'name' },
 *     { id: 'email', header: 'Email', accessorKey: 'email' },
 *   ],
 *   enableSorting: true,
 *   enableFiltering: true,
 *   enablePagination: true,
 * });
 * ```
 */
export function createTailGrid<TData>(
  options: TailGridOptions<TData>
): TailGridInstance<TData> {
  // Initialize state
  let sorting: SortingState = options.initialSorting ?? [];
  let columnFilters: ColumnFiltersState = [];
  let globalFilter = '';
  let pagination: TanStackPaginationState = {
    pageIndex: options.initialPagination?.pageIndex ?? 0,
    pageSize: options.initialPagination?.pageSize ?? 10,
  };
  let rowSelection: RowSelectionState = options.initialRowSelection ?? {};
  let columnOrder: string[] = options.columns.map((col) => col.id);
  let columnVisibility: Record<string, boolean> = {};

  // Convert TailGrid columns to TanStack columns
  const tanstackColumns = options.columns.map((col) => ({
    id: col.id,
    header: col.header,
    accessorKey: col.accessorKey,
    accessorFn: col.accessorFn,
    enableSorting: col.enableSorting ?? options.enableSorting ?? true,
    enableColumnFilter: col.enableFiltering ?? options.enableFiltering ?? true,
    size: col.width,
    minSize: col.minWidth ?? 50,
    maxSize: col.maxWidth ?? 500,
    enableResizing: col.enableResizing ?? options.enableColumnResizing ?? true,
  }));

  // Create TanStack Table instance
  const table = createTable({
    data: options.data,
    columns: tanstackColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
      columnOrder,
      columnVisibility,
    },
    onStateChange: () => {
      // Required by TanStack Table but we handle individual state changes
    },
    renderFallbackValue: null,
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater;
      options.onSortingChange?.(sorting);
    },
    onColumnFiltersChange: (updater) => {
      columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      const filterState = convertToFilterState(columnFilters, globalFilter);
      options.onFiltersChange?.(filterState);
    },
    onGlobalFilterChange: (updater) => {
      globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
      const filterState = convertToFilterState(columnFilters, globalFilter);
      options.onFiltersChange?.(filterState);
    },
    onPaginationChange: (updater) => {
      pagination = typeof updater === 'function' ? updater(pagination) : updater;
      options.onPaginationChange?.({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
    },
    onRowSelectionChange: (updater) => {
      rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      options.onRowSelectionChange?.(rowSelection);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: options.enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: options.enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: options.enablePagination ? getPaginationRowModel() : undefined,
    enableRowSelection: options.enableRowSelection,
    enableMultiRowSelection: options.enableMultiRowSelection ?? true,
    getRowId: options.getRowId,
  });

  // Helper to convert column filters to FilterState
  function convertToFilterState(
    filters: ColumnFiltersState,
    global: string
  ): FilterState {
    return {
      columnFilters: filters.map((f) => ({
        id: f.id,
        operator: 'contains' as const,
        value: f.value,
      })),
      globalFilter: global || undefined,
    };
  }

  // Return TailGrid instance
  const instance: TailGridInstance<TData> = {
    // Row getters
    getRows: () => options.data,
    getFilteredRows: () => table.getFilteredRowModel().rows.map((r) => r.original),
    getSortedRows: () => table.getSortedRowModel().rows.map((r) => r.original),
    getPaginatedRows: () => table.getRowModel().rows.map((r) => r.original),

    // Sorting
    getSorting: () => sorting,
    setSorting: (newSorting) => {
      sorting = newSorting;
      table.setSorting(newSorting);
    },
    toggleSort: (columnId, desc) => {
      const column = table.getColumn(columnId);
      if (column) {
        column.toggleSorting(desc);
      }
    },
    clearSorting: () => {
      sorting = [];
      table.resetSorting();
    },

    // Filtering
    getFilters: () => convertToFilterState(columnFilters, globalFilter),
    setColumnFilter: (filter) => {
      const column = table.getColumn(filter.id);
      if (column) {
        column.setFilterValue(filter.value);
      }
    },
    removeColumnFilter: (columnId) => {
      const column = table.getColumn(columnId);
      if (column) {
        column.setFilterValue(undefined);
      }
    },
    setGlobalFilter: (value) => {
      globalFilter = value;
      table.setGlobalFilter(value);
    },
    clearFilters: () => {
      columnFilters = [];
      globalFilter = '';
      table.resetColumnFilters();
      table.resetGlobalFilter();
    },

    // Pagination
    getPaginationInfo: (): PaginationInfo => {
      const pageCount = table.getPageCount();
      return {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        pageCount,
        totalRows: table.getFilteredRowModel().rows.length,
        canPreviousPage: table.getCanPreviousPage(),
        canNextPage: table.getCanNextPage(),
      };
    },
    setPageIndex: (index) => {
      pagination.pageIndex = index;
      table.setPageIndex(index);
    },
    setPageSize: (size) => {
      pagination.pageSize = size;
      table.setPageSize(size);
    },
    firstPage: () => table.firstPage(),
    previousPage: () => table.previousPage(),
    nextPage: () => table.nextPage(),
    lastPage: () => table.lastPage(),

    // Selection
    getSelectedRowIds: () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    getSelectedRows: () => {
      return table
        .getSelectedRowModel()
        .rows.map((r) => r.original);
    },
    toggleRowSelection: (rowId) => {
      const row = table.getRow(rowId);
      if (row) {
        row.toggleSelected();
      }
    },
    toggleAllRowsSelection: () => {
      table.toggleAllRowsSelected();
    },
    setRowSelection: (selection) => {
      rowSelection = selection;
      table.setRowSelection(selection);
    },
    clearSelection: () => {
      rowSelection = {};
      table.resetRowSelection();
    },

    // Columns
    getColumns: () => options.columns,
    getVisibleColumns: () => {
      return options.columns.filter((col) => columnVisibility[col.id] !== false);
    },
    toggleColumnVisibility: (columnId) => {
      columnVisibility[columnId] = !columnVisibility[columnId];
      table.setColumnVisibility(columnVisibility);
    },
    reorderColumns: (newOrder) => {
      columnOrder = newOrder;
      table.setColumnOrder(newOrder);
    },

    // Internal
    _table: table,
  };

  return instance;
}
