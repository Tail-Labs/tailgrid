import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  GridEngine,
  type TailGridOptions,
  type TailGridColumn,
  type ColumnFilter,
  type PaginationInfo,
  type RowSelection,
  type GridRow,
  type GridColumn,
} from '@tailgrid/core';

// Re-export sorting state type for convenience
export type SortingState = Array<{ id: string; desc: boolean }>;

export interface UseTailGridReturn<TData> {
  // Row model
  rows: TData[];
  rowModel: GridRow<TData>[];

  // Column model
  columns: GridColumn<TData>[];
  columnDefs: TailGridColumn<TData>[];

  // Sorting
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  toggleSort: (columnId: string, multi?: boolean) => void;
  clearSorting: () => void;

  // Filtering
  columnFilters: ColumnFilter[];
  globalFilter: string;
  setColumnFilter: (columnId: string, value: unknown) => void;
  setGlobalFilter: (value: string) => void;
  clearFilters: () => void;

  // Pagination
  pagination: { pageIndex: number; pageSize: number };
  paginationInfo: PaginationInfo;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;

  // Selection
  rowSelection: RowSelection;
  selectedRows: TData[];
  toggleRowSelection: (rowId: string) => void;
  toggleAllRowsSelection: () => void;
  clearSelection: () => void;
  getIsAllRowsSelected: () => boolean;
  getIsSomeRowsSelected: () => boolean;

  // Column sizing
  columnSizing: Record<string, number>;
  setColumnSize: (columnId: string, size: number) => void;
  getColumnSize: (columnId: string) => number;
  resetColumnSize: (columnId: string) => void;
  setResizingColumnId: (columnId: string | null) => void;
  resizingColumnId: string | null;

  // Data access API
  getRowById: (rowId: string) => TData | undefined;
  getRowByIndex: (index: number) => TData | undefined;
  getCellValue: (rowId: string, columnId: string) => unknown;
  setCellValue: (rowId: string, columnId: string, value: unknown) => void;
  updateRow: (rowId: string, updates: Partial<TData>) => void;
  addRow: (row: TData) => void;
  removeRow: (rowId: string) => void;
  getColumnIds: () => string[];
  getColumnById: (columnId: string) => TailGridColumn<TData> | undefined;
  getColumnValues: (columnId: string) => unknown[];
}

/**
 * React hook for TailGrid - Custom implementation without TanStack Table
 *
 * @example
 * ```tsx
 * const { rows, sorting, setSorting } = useTailGrid({
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
  // Create engine ref to maintain instance across renders
  const engineRef = useRef<GridEngine<TData> | null>(null);

  // Initialize engine
  if (!engineRef.current) {
    engineRef.current = new GridEngine({
      data: options.data,
      columns: options.columns,
      initialSorting: options.initialSorting,
      initialColumnFilters: options.initialFilters?.columnFilters,
      initialGlobalFilter: options.initialFilters?.globalFilter,
      initialPagination: options.initialPagination ?? {
        pageIndex: 0,
        pageSize: (options as unknown as { pageSize?: number }).pageSize ?? 10,
      },
      initialRowSelection: options.initialRowSelection,
      enableSorting: options.enableSorting,
      enableFiltering: options.enableFiltering,
      enablePagination: options.enablePagination,
      enableRowSelection: options.enableRowSelection,
      enableMultiRowSelection: options.enableMultiRowSelection,
      getRowId: options.getRowId,
    });
  }

  const engine = engineRef.current;

  // Synchronize engine options immediately (not in useEffect)
  // This ensures the engine has the correct options before rendering
  engine.setOptions({
    enableSorting: options.enableSorting,
    enableFiltering: options.enableFiltering,
    enablePagination: options.enablePagination,
    enableRowSelection: options.enableRowSelection,
    enableMultiRowSelection: options.enableMultiRowSelection,
  });

  // Update engine when data or columns change
  useEffect(() => {
    engine.setData(options.data);
  }, [options.data, engine]);

  useEffect(() => {
    engine.setColumns(options.columns);
  }, [options.columns, engine]);

  // State for triggering re-renders
  const [, forceUpdate] = useState({});
  const rerender = useCallback(() => forceUpdate({}), []);

  // Sorting state
  const [sorting, setSortingState] = useState<SortingState>(
    options.initialSorting ?? []
  );

  const setSorting = useCallback(
    (newSorting: SortingState) => {
      engine.setSorting(newSorting);
      setSortingState(newSorting);
      options.onSortingChange?.(newSorting);
    },
    [engine, options]
  );

  const toggleSort = useCallback(
    (columnId: string, multi = false) => {
      engine.toggleSort(columnId, multi);
      const newSorting = engine.getSorting();
      setSortingState(newSorting);
      options.onSortingChange?.(newSorting);
    },
    [engine, options]
  );

  const clearSorting = useCallback(() => {
    engine.clearSorting();
    setSortingState([]);
    options.onSortingChange?.([]);
  }, [engine, options]);

  // Filtering state
  const [columnFilters, setColumnFiltersState] = useState<ColumnFilter[]>(
    options.initialFilters?.columnFilters ?? []
  );
  const [globalFilter, setGlobalFilterState] = useState(
    options.initialFilters?.globalFilter ?? ''
  );

  const setColumnFilter = useCallback(
    (columnId: string, value: unknown) => {
      engine.setColumnFilter(columnId, value);
      const newFilters = engine.getColumnFilters();
      setColumnFiltersState(newFilters);
      options.onFiltersChange?.({
        columnFilters: newFilters,
        globalFilter: engine.getGlobalFilter(),
      });
    },
    [engine, options]
  );

  const setGlobalFilter = useCallback(
    (value: string) => {
      engine.setGlobalFilter(value);
      setGlobalFilterState(value);
      options.onFiltersChange?.({
        columnFilters: engine.getColumnFilters(),
        globalFilter: value,
      });
    },
    [engine, options]
  );

  const clearFilters = useCallback(() => {
    engine.clearFilters();
    setColumnFiltersState([]);
    setGlobalFilterState('');
    options.onFiltersChange?.({ columnFilters: [], globalFilter: '' });
  }, [engine, options]);

  // Pagination state
  const [pagination, setPaginationState] = useState({
    pageIndex: options.initialPagination?.pageIndex ?? 0,
    pageSize: options.initialPagination?.pageSize ?? (options as unknown as { pageSize?: number }).pageSize ?? 10,
  });

  const setPageIndex = useCallback(
    (index: number) => {
      engine.setPageIndex(index);
      const newPagination = engine.getPagination();
      setPaginationState(newPagination);
      options.onPaginationChange?.(newPagination);
    },
    [engine, options]
  );

  const setPageSize = useCallback(
    (size: number) => {
      engine.setPageSize(size);
      const newPagination = engine.getPagination();
      setPaginationState(newPagination);
      options.onPaginationChange?.(newPagination);
    },
    [engine, options]
  );

  const nextPage = useCallback(() => {
    engine.nextPage();
    const newPagination = engine.getPagination();
    setPaginationState(newPagination);
    options.onPaginationChange?.(newPagination);
  }, [engine, options]);

  const previousPage = useCallback(() => {
    engine.previousPage();
    const newPagination = engine.getPagination();
    setPaginationState(newPagination);
    options.onPaginationChange?.(newPagination);
  }, [engine, options]);

  const firstPage = useCallback(() => {
    engine.firstPage();
    const newPagination = engine.getPagination();
    setPaginationState(newPagination);
    options.onPaginationChange?.(newPagination);
  }, [engine, options]);

  const lastPage = useCallback(() => {
    engine.lastPage();
    const newPagination = engine.getPagination();
    setPaginationState(newPagination);
    options.onPaginationChange?.(newPagination);
  }, [engine, options]);

  // Selection state
  const [rowSelection, setRowSelectionState] = useState<RowSelection>(
    options.initialRowSelection ?? {}
  );

  const toggleRowSelection = useCallback(
    (rowId: string) => {
      engine.toggleRowSelection(rowId);
      const newSelection = engine.getRowSelection();
      setRowSelectionState(newSelection);
      options.onRowSelectionChange?.(newSelection);
    },
    [engine, options]
  );

  const toggleAllRowsSelection = useCallback(() => {
    engine.toggleAllRowsSelection();
    const newSelection = engine.getRowSelection();
    setRowSelectionState(newSelection);
    options.onRowSelectionChange?.(newSelection);
  }, [engine, options]);

  const clearSelection = useCallback(() => {
    engine.clearSelection();
    setRowSelectionState({});
    options.onRowSelectionChange?.({});
  }, [engine, options]);

  const getIsAllRowsSelected = useCallback(
    () => engine.getIsAllRowsSelected(),
    [engine]
  );

  const getIsSomeRowsSelected = useCallback(
    () => engine.getIsSomeRowsSelected(),
    [engine]
  );

  // Column sizing state
  const [columnSizing, setColumnSizingState] = useState<Record<string, number>>(
    engine.getColumnSizing()
  );
  const [resizingColumnId, setResizingColumnIdState] = useState<string | null>(null);

  const setColumnSize = useCallback(
    (columnId: string, size: number) => {
      engine.setColumnSize(columnId, size);
      setColumnSizingState(engine.getColumnSizing());
    },
    [engine]
  );

  const getColumnSize = useCallback(
    (columnId: string) => engine.getColumnSize(columnId),
    [engine]
  );

  const resetColumnSize = useCallback(
    (columnId: string) => {
      engine.resetColumnSize(columnId);
      setColumnSizingState(engine.getColumnSizing());
    },
    [engine]
  );

  const setResizingColumnId = useCallback(
    (columnId: string | null) => {
      engine.setResizingColumnId(columnId);
      setResizingColumnIdState(columnId);
    },
    [engine]
  );

  // Computed values
  const paginationInfo = useMemo(
    () => engine.getPaginationInfo(),
    [engine, pagination, sorting, columnFilters, globalFilter]
  );

  const rows = useMemo(
    () => engine.getPaginatedRows(),
    [engine, pagination, sorting, columnFilters, globalFilter, options.data]
  );

  const rowModel = useMemo(
    () => engine.getRowModel(),
    [engine, pagination, sorting, columnFilters, globalFilter, rowSelection, options.data, options.enableRowSelection]
  );

  const columns = useMemo(
    () => engine.getColumns(),
    [engine, sorting, columnSizing, resizingColumnId, options.columns]
  );

  const selectedRows = useMemo(
    () => engine.getSelectedRows(),
    [engine, rowSelection]
  );

  return {
    // Row model
    rows,
    rowModel,

    // Column model
    columns,
    columnDefs: options.columns,

    // Sorting
    sorting,
    setSorting,
    toggleSort,
    clearSorting,

    // Filtering
    columnFilters,
    globalFilter,
    setColumnFilter,
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
    getIsAllRowsSelected,
    getIsSomeRowsSelected,

    // Column sizing
    columnSizing,
    setColumnSize,
    getColumnSize,
    resetColumnSize,
    setResizingColumnId,
    resizingColumnId,

    // Data access API
    getRowById: (rowId: string) => engine.getRowById(rowId),
    getRowByIndex: (index: number) => engine.getRowByIndex(index),
    getCellValue: (rowId: string, columnId: string) => engine.getCellValue(rowId, columnId),
    setCellValue: (rowId: string, columnId: string, value: unknown) => {
      engine.setCellValue(rowId, columnId, value);
      rerender();
    },
    updateRow: (rowId: string, updates: Partial<TData>) => {
      engine.updateRow(rowId, updates);
      rerender();
    },
    addRow: (row: TData) => {
      engine.addRow(row);
      rerender();
    },
    removeRow: (rowId: string) => {
      engine.removeRow(rowId);
      rerender();
    },
    getColumnIds: () => engine.getColumnIds(),
    getColumnById: (columnId: string) => engine.getColumnById(columnId),
    getColumnValues: (columnId: string) => engine.getColumnValues(columnId),
  };
}
