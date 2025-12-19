import { GridEngine } from './engine';
import type {
  TailGridOptions,
  TailGridInstance,
  FilterState,
  PaginationInfo,
  SortingState,
} from './types';

/**
 * Create a TailGrid instance (framework-agnostic)
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
  // Create the grid engine
  const engine = new GridEngine<TData>({
    data: options.data,
    columns: options.columns,
    initialSorting: options.initialSorting,
    initialColumnFilters: options.initialFilters?.columnFilters,
    initialGlobalFilter: options.initialFilters?.globalFilter,
    initialPagination: options.initialPagination ?? {
      pageIndex: 0,
      pageSize: 10,
    },
    initialRowSelection: options.initialRowSelection,
    enableSorting: options.enableSorting,
    enableFiltering: options.enableFiltering,
    enablePagination: options.enablePagination,
    enableRowSelection: options.enableRowSelection,
    enableMultiRowSelection: options.enableMultiRowSelection,
    getRowId: options.getRowId,
  });

  // Track column order and visibility
  let columnOrder: string[] = options.columns.map((col) => col.id);
  let columnVisibility: Record<string, boolean> = {};

  // Return TailGrid instance
  const instance: TailGridInstance<TData> = {
    // Row getters
    getRows: () => options.data,
    getFilteredRows: () => engine.getFilteredRows(),
    getSortedRows: () => engine.getSortedRows(),
    getPaginatedRows: () => engine.getPaginatedRows(),

    // Sorting
    getSorting: () => engine.getSorting(),
    setSorting: (newSorting: SortingState) => {
      engine.setSorting(newSorting);
      options.onSortingChange?.(newSorting);
    },
    toggleSort: (columnId: string, desc?: boolean) => {
      if (desc !== undefined) {
        // Set explicit direction
        const currentSorting = [...engine.getSorting()];
        const existingIndex = currentSorting.findIndex((s) => s.id === columnId);
        if (existingIndex >= 0) {
          const existing = currentSorting[existingIndex];
          if (existing) {
            existing.desc = desc;
          }
        } else {
          currentSorting.push({ id: columnId, desc });
        }
        engine.setSorting(currentSorting);
      } else {
        engine.toggleSort(columnId, false);
      }
      options.onSortingChange?.(engine.getSorting());
    },
    clearSorting: () => {
      engine.clearSorting();
      options.onSortingChange?.([]);
    },

    // Filtering
    getFilters: (): FilterState => ({
      columnFilters: engine.getColumnFilters(),
      globalFilter: engine.getGlobalFilter() || undefined,
    }),
    setColumnFilter: (filter) => {
      engine.setColumnFilter(filter.id, filter.value);
      options.onFiltersChange?.({
        columnFilters: engine.getColumnFilters(),
        globalFilter: engine.getGlobalFilter() || undefined,
      });
    },
    removeColumnFilter: (columnId) => {
      engine.setColumnFilter(columnId, undefined);
      options.onFiltersChange?.({
        columnFilters: engine.getColumnFilters(),
        globalFilter: engine.getGlobalFilter() || undefined,
      });
    },
    setGlobalFilter: (value) => {
      engine.setGlobalFilter(value);
      options.onFiltersChange?.({
        columnFilters: engine.getColumnFilters(),
        globalFilter: value || undefined,
      });
    },
    clearFilters: () => {
      engine.clearFilters();
      options.onFiltersChange?.({ columnFilters: [], globalFilter: undefined });
    },

    // Pagination
    getPaginationInfo: (): PaginationInfo => engine.getPaginationInfo(),
    setPageIndex: (index) => {
      engine.setPageIndex(index);
      options.onPaginationChange?.(engine.getPagination());
    },
    setPageSize: (size) => {
      engine.setPageSize(size);
      options.onPaginationChange?.(engine.getPagination());
    },
    firstPage: () => {
      engine.firstPage();
      options.onPaginationChange?.(engine.getPagination());
    },
    previousPage: () => {
      engine.previousPage();
      options.onPaginationChange?.(engine.getPagination());
    },
    nextPage: () => {
      engine.nextPage();
      options.onPaginationChange?.(engine.getPagination());
    },
    lastPage: () => {
      engine.lastPage();
      options.onPaginationChange?.(engine.getPagination());
    },

    // Selection
    getSelectedRowIds: () => {
      const selection = engine.getRowSelection();
      return Object.keys(selection).filter((id) => selection[id]);
    },
    getSelectedRows: () => engine.getSelectedRows(),
    toggleRowSelection: (rowId) => {
      engine.toggleRowSelection(rowId);
      options.onRowSelectionChange?.(engine.getRowSelection());
    },
    toggleAllRowsSelection: () => {
      engine.toggleAllRowsSelection();
      options.onRowSelectionChange?.(engine.getRowSelection());
    },
    setRowSelection: (selection) => {
      engine.setRowSelection(selection);
      options.onRowSelectionChange?.(selection);
    },
    clearSelection: () => {
      engine.clearSelection();
      options.onRowSelectionChange?.({});
    },

    // Columns
    getColumns: () => options.columns,
    getVisibleColumns: () => {
      return options.columns.filter((col) => columnVisibility[col.id] !== false);
    },
    toggleColumnVisibility: (columnId) => {
      columnVisibility[columnId] = !columnVisibility[columnId];
    },
    reorderColumns: (newOrder) => {
      columnOrder = newOrder;
    },

    // Internal - expose the engine for advanced usage
    _engine: engine,
  };

  return instance;
}
