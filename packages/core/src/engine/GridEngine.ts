import type { TailGridColumn, ColumnFilter, RowSelection } from '../types';
import {
  sortData,
  SortingState,
  filterData,
  globalFilterData,
  paginateData,
  PaginationState,
  PaginationInfo,
  getPaginationInfo,
} from './processors';
import { createRow, GridRow } from './models/RowModel';
import { createColumns, GridColumn } from './models/ColumnModel';

// ============================================
// TYPES
// ============================================

export interface GridEngineOptions<TData> {
  data: TData[];
  columns: TailGridColumn<TData>[];

  // Initial state
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFilter[];
  initialGlobalFilter?: string;
  initialPagination?: PaginationState;
  initialRowSelection?: RowSelection;

  // Feature flags
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;

  // Row ID
  getRowId?: (row: TData, index: number) => string;
}

export interface GridEngineState<TData> {
  // Core data
  data: TData[];
  columns: TailGridColumn<TData>[];

  // State
  sorting: SortingState;
  columnFilters: ColumnFilter[];
  globalFilter: string;
  pagination: PaginationState;
  rowSelection: RowSelection;
  columnSizing: Record<string, number>;
  resizingColumnId: string | null;

  // Feature flags
  enableSorting: boolean;
  enableFiltering: boolean;
  enablePagination: boolean;
  enableRowSelection: boolean;
  enableMultiRowSelection: boolean;

  // Options
  getRowId: (row: TData, index: number) => string;
}

// ============================================
// GRID ENGINE CLASS
// ============================================

/**
 * GridEngine - Core data processing engine for TailGrid
 *
 * Handles sorting, filtering, pagination, and selection without external dependencies.
 */
export class GridEngine<TData> {
  private state: GridEngineState<TData>;

  constructor(options: GridEngineOptions<TData>) {
    this.state = {
      data: options.data,
      columns: options.columns,
      sorting: options.initialSorting ?? [],
      columnFilters: options.initialColumnFilters ?? [],
      globalFilter: options.initialGlobalFilter ?? '',
      pagination: options.initialPagination ?? { pageIndex: 0, pageSize: 10 },
      rowSelection: options.initialRowSelection ?? {},
      columnSizing: {},
      resizingColumnId: null,
      enableSorting: options.enableSorting ?? true,
      enableFiltering: options.enableFiltering ?? true,
      enablePagination: options.enablePagination ?? false,
      enableRowSelection: options.enableRowSelection ?? false,
      enableMultiRowSelection: options.enableMultiRowSelection ?? true,
      getRowId: options.getRowId ?? ((_, index) => String(index)),
    };

    // Initialize column sizes from column definitions
    options.columns.forEach((col) => {
      if (col.width) {
        this.state.columnSizing[col.id] = col.width;
      }
    });
  }

  // ============================================
  // DATA PROCESSING
  // ============================================

  /**
   * Get all raw data
   */
  getAllRows(): TData[] {
    return this.state.data;
  }

  /**
   * Get filtered rows (global filter + column filters applied)
   */
  getFilteredRows(): TData[] {
    let result = this.state.data;

    // Apply global filter
    if (this.state.globalFilter) {
      result = globalFilterData(result, this.state.globalFilter, this.state.columns);
    }

    // Apply column filters
    if (this.state.columnFilters.length > 0) {
      result = filterData(result, this.state.columnFilters, this.state.columns);
    }

    return result;
  }

  /**
   * Get filtered and sorted rows
   */
  getSortedRows(): TData[] {
    const filtered = this.getFilteredRows();

    if (this.state.sorting.length > 0) {
      return sortData(filtered, this.state.sorting, this.state.columns);
    }

    return filtered;
  }

  /**
   * Get final rows (filtered, sorted, paginated)
   */
  getPaginatedRows(): TData[] {
    const sorted = this.getSortedRows();

    if (this.state.enablePagination) {
      return paginateData(sorted, this.state.pagination);
    }

    return sorted;
  }

  /**
   * Get rows as GridRow objects with methods
   */
  getRowModel(): GridRow<TData>[] {
    const data = this.getPaginatedRows();

    return data.map((row, index) => {
      const rowId = this.state.getRowId(row, index);
      const isSelected = this.state.rowSelection[rowId] ?? false;

      return createRow(
        row,
        index,
        rowId,
        this.state.columns,
        isSelected,
        this.state.enableRowSelection
      );
    });
  }

  /**
   * Get column models with current state
   */
  getColumns(): GridColumn<TData>[] {
    return createColumns(
      this.state.columns,
      this.state.sorting,
      this.state.enableSorting,
      this.state.columnSizing,
      this.state.resizingColumnId
    );
  }

  // ============================================
  // SORTING
  // ============================================

  getSorting(): SortingState {
    return this.state.sorting;
  }

  setSorting(sorting: SortingState): void {
    this.state.sorting = sorting;
  }

  toggleSort(columnId: string, multi = false): void {
    const column = this.state.columns.find((c) => c.id === columnId);
    if (!column || column.enableSorting === false) return;

    const existing = this.state.sorting.find((s) => s.id === columnId);

    if (!existing) {
      // Add new sort (ascending)
      if (multi) {
        this.state.sorting = [...this.state.sorting, { id: columnId, desc: false }];
      } else {
        this.state.sorting = [{ id: columnId, desc: false }];
      }
    } else if (!existing.desc) {
      // Switch to descending
      this.state.sorting = this.state.sorting.map((s) =>
        s.id === columnId ? { ...s, desc: true } : s
      );
    } else {
      // Remove sort
      this.state.sorting = this.state.sorting.filter((s) => s.id !== columnId);
    }
  }

  clearSorting(): void {
    this.state.sorting = [];
  }

  // ============================================
  // FILTERING
  // ============================================

  getColumnFilters(): ColumnFilter[] {
    return this.state.columnFilters;
  }

  setColumnFilter(columnId: string, value: unknown): void {
    if (value === undefined || value === null || value === '') {
      // Remove filter
      this.state.columnFilters = this.state.columnFilters.filter(
        (f) => f.id !== columnId
      );
    } else {
      const existing = this.state.columnFilters.find((f) => f.id === columnId);
      if (existing) {
        // Update existing filter
        this.state.columnFilters = this.state.columnFilters.map((f) =>
          f.id === columnId ? { ...f, value } : f
        );
      } else {
        // Add new filter with default operator
        this.state.columnFilters = [
          ...this.state.columnFilters,
          { id: columnId, operator: 'contains', value },
        ];
      }
    }
  }

  setColumnFilterWithOperator(filter: ColumnFilter): void {
    const existing = this.state.columnFilters.find((f) => f.id === filter.id);
    if (existing) {
      this.state.columnFilters = this.state.columnFilters.map((f) =>
        f.id === filter.id ? filter : f
      );
    } else {
      this.state.columnFilters = [...this.state.columnFilters, filter];
    }
  }

  removeColumnFilter(columnId: string): void {
    this.state.columnFilters = this.state.columnFilters.filter(
      (f) => f.id !== columnId
    );
  }

  getGlobalFilter(): string {
    return this.state.globalFilter;
  }

  setGlobalFilter(value: string): void {
    this.state.globalFilter = value;
  }

  clearFilters(): void {
    this.state.columnFilters = [];
    this.state.globalFilter = '';
  }

  // ============================================
  // PAGINATION
  // ============================================

  getPagination(): PaginationState {
    return this.state.pagination;
  }

  getPaginationInfo(): PaginationInfo {
    const totalRows = this.getSortedRows().length;
    return getPaginationInfo(totalRows, this.state.pagination);
  }

  setPageIndex(index: number): void {
    const info = this.getPaginationInfo();
    if (index >= 0 && index < info.pageCount) {
      this.state.pagination = { ...this.state.pagination, pageIndex: index };
    }
  }

  setPageSize(size: number): void {
    this.state.pagination = { ...this.state.pagination, pageSize: size, pageIndex: 0 };
  }

  nextPage(): void {
    const info = this.getPaginationInfo();
    if (info.canNextPage) {
      this.setPageIndex(this.state.pagination.pageIndex + 1);
    }
  }

  previousPage(): void {
    const info = this.getPaginationInfo();
    if (info.canPreviousPage) {
      this.setPageIndex(this.state.pagination.pageIndex - 1);
    }
  }

  firstPage(): void {
    this.setPageIndex(0);
  }

  lastPage(): void {
    const info = this.getPaginationInfo();
    this.setPageIndex(info.pageCount - 1);
  }

  // ============================================
  // SELECTION
  // ============================================

  getRowSelection(): RowSelection {
    return this.state.rowSelection;
  }

  setRowSelection(selection: RowSelection): void {
    this.state.rowSelection = selection;
  }

  toggleRowSelection(rowId: string): void {
    if (!this.state.enableRowSelection) return;

    const isSelected = this.state.rowSelection[rowId];

    if (this.state.enableMultiRowSelection) {
      this.state.rowSelection = {
        ...this.state.rowSelection,
        [rowId]: !isSelected,
      };
    } else {
      // Single selection mode
      this.state.rowSelection = isSelected ? {} : { [rowId]: true };
    }
  }

  toggleAllRowsSelection(): void {
    if (!this.state.enableRowSelection || !this.state.enableMultiRowSelection) return;

    const allRows = this.getSortedRows();
    const allSelected = allRows.every((row, index) => {
      const rowId = this.state.getRowId(row, index);
      return this.state.rowSelection[rowId];
    });

    if (allSelected) {
      // Deselect all
      this.state.rowSelection = {};
    } else {
      // Select all
      const newSelection: RowSelection = {};
      allRows.forEach((row, index) => {
        const rowId = this.state.getRowId(row, index);
        newSelection[rowId] = true;
      });
      this.state.rowSelection = newSelection;
    }
  }

  getIsAllRowsSelected(): boolean {
    const allRows = this.getSortedRows();
    if (allRows.length === 0) return false;

    return allRows.every((row, index) => {
      const rowId = this.state.getRowId(row, index);
      return this.state.rowSelection[rowId];
    });
  }

  getIsSomeRowsSelected(): boolean {
    const selectedCount = Object.values(this.state.rowSelection).filter(Boolean).length;
    const allRows = this.getSortedRows();
    return selectedCount > 0 && selectedCount < allRows.length;
  }

  getSelectedRows(): TData[] {
    return this.getSortedRows().filter((row, index) => {
      const rowId = this.state.getRowId(row, index);
      return this.state.rowSelection[rowId];
    });
  }

  clearSelection(): void {
    this.state.rowSelection = {};
  }

  // ============================================
  // COLUMN SIZING
  // ============================================

  getColumnSizing(): Record<string, number> {
    return this.state.columnSizing;
  }

  setColumnSize(columnId: string, size: number): void {
    const column = this.state.columns.find((c) => c.id === columnId);
    if (!column) return;

    const minSize = column.minWidth ?? 50;
    const maxSize = column.maxWidth ?? 500;
    const clampedSize = Math.max(minSize, Math.min(maxSize, size));

    this.state.columnSizing = {
      ...this.state.columnSizing,
      [columnId]: clampedSize,
    };
  }

  getColumnSize(columnId: string): number {
    const column = this.state.columns.find((c) => c.id === columnId);
    return this.state.columnSizing[columnId] ?? column?.width ?? 150;
  }

  setResizingColumnId(columnId: string | null): void {
    this.state.resizingColumnId = columnId;
  }

  getResizingColumnId(): string | null {
    return this.state.resizingColumnId;
  }

  resetColumnSize(columnId: string): void {
    const column = this.state.columns.find((c) => c.id === columnId);
    if (column) {
      this.state.columnSizing[columnId] = column.width ?? 150;
    }
  }

  // ============================================
  // STATE UPDATE
  // ============================================

  /**
   * Update data (for external data changes)
   */
  setData(data: TData[]): void {
    this.state.data = data;
  }

  /**
   * Update columns (for dynamic column changes)
   */
  setColumns(columns: TailGridColumn<TData>[]): void {
    this.state.columns = columns;
  }

  /**
   * Update options (feature flags)
   */
  setOptions(options: {
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;
  }): void {
    // Always update - use ?? to provide sensible defaults for undefined
    this.state.enableSorting = options.enableSorting ?? true;
    this.state.enableFiltering = options.enableFiltering ?? true;
    this.state.enablePagination = options.enablePagination ?? false;
    this.state.enableRowSelection = options.enableRowSelection ?? false;
    this.state.enableMultiRowSelection = options.enableMultiRowSelection ?? true;
  }

  /**
   * Get full state (for debugging or serialization)
   */
  getState(): GridEngineState<TData> {
    return { ...this.state };
  }

  // ============================================
  // CONVENIENCE DATA ACCESS API
  // ============================================

  /**
   * Get a row by its ID
   */
  getRowById(rowId: string): TData | undefined {
    return this.state.data.find((row, index) => {
      const id = this.state.getRowId(row, index);
      return id === rowId;
    });
  }

  /**
   * Get a row by its index (in the current sorted/filtered view)
   */
  getRowByIndex(index: number): TData | undefined {
    const rows = this.getSortedRows();
    return rows[index];
  }

  /**
   * Get a cell value by row ID and column ID
   */
  getCellValue(rowId: string, columnId: string): unknown {
    const row = this.getRowById(rowId);
    if (!row) return undefined;

    const column = this.state.columns.find((c) => c.id === columnId);
    if (!column) return undefined;

    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      return (row as Record<string, unknown>)[column.accessorKey];
    }
    return undefined;
  }

  /**
   * Update a row's data by ID (immutable - returns new data array)
   */
  updateRow(rowId: string, updates: Partial<TData>): void {
    this.state.data = this.state.data.map((row, index) => {
      const id = this.state.getRowId(row, index);
      if (id === rowId) {
        return { ...row, ...updates };
      }
      return row;
    });
  }

  /**
   * Update a cell value by row ID and column ID
   */
  setCellValue(rowId: string, columnId: string, value: unknown): void {
    const column = this.state.columns.find((c) => c.id === columnId);
    if (!column || !column.accessorKey) return;

    this.state.data = this.state.data.map((row, index) => {
      const id = this.state.getRowId(row, index);
      if (id === rowId) {
        return { ...row, [column.accessorKey as string]: value };
      }
      return row;
    });
  }

  /**
   * Add a new row
   */
  addRow(row: TData): void {
    this.state.data = [...this.state.data, row];
  }

  /**
   * Remove a row by ID
   */
  removeRow(rowId: string): void {
    this.state.data = this.state.data.filter((row, index) => {
      const id = this.state.getRowId(row, index);
      return id !== rowId;
    });
  }

  /**
   * Get all column IDs
   */
  getColumnIds(): string[] {
    return this.state.columns.map((c) => c.id);
  }

  /**
   * Get column by ID
   */
  getColumnById(columnId: string): TailGridColumn<TData> | undefined {
    return this.state.columns.find((c) => c.id === columnId);
  }

  /**
   * Get all values for a column (from sorted/filtered rows)
   */
  getColumnValues(columnId: string): unknown[] {
    const column = this.state.columns.find((c) => c.id === columnId);
    if (!column) return [];

    return this.getSortedRows().map((row) => {
      if (column.accessorFn) {
        return column.accessorFn(row);
      }
      if (column.accessorKey) {
        return (row as Record<string, unknown>)[column.accessorKey];
      }
      return undefined;
    });
  }
}

export default GridEngine;
