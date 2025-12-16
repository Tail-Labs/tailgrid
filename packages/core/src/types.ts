import type {
  ColumnDef,
  SortingState,
  FilterFn,
  Row,
  Table,
} from '@tanstack/table-core';

// ============================================
// CORE TYPES
// ============================================

export type SortDirection = 'asc' | 'desc';

export interface TailGridColumn<TData> extends Omit<ColumnDef<TData, unknown>, 'id'> {
  /** Unique column identifier */
  id: string;
  /** Column header label */
  header: string;
  /** Data accessor key */
  accessorKey?: keyof TData & string;
  /** Custom accessor function */
  accessorFn?: (row: TData) => unknown;
  /** Enable sorting for this column */
  enableSorting?: boolean;
  /** Enable filtering for this column */
  enableFiltering?: boolean;
  /** Column width in pixels */
  width?: number;
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Enable column resizing */
  enableResizing?: boolean;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer */
  cell?: (props: CellContext<TData>) => unknown;
  /** Column data type (for AI parsing) */
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'currency';
}

export interface CellContext<TData> {
  /** The row data */
  row: TData;
  /** The cell value */
  value: unknown;
  /** Row index */
  rowIndex: number;
  /** Column definition */
  column: TailGridColumn<TData>;
}

// ============================================
// SORTING TYPES
// ============================================

export interface SortConfig {
  /** Column ID to sort by */
  id: string;
  /** Sort direction */
  desc: boolean;
}

export type { SortingState };

// ============================================
// FILTERING TYPES
// ============================================

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'inList'
  | 'isEmpty'
  | 'isNotEmpty';

export interface ColumnFilter {
  /** Column ID */
  id: string;
  /** Filter operator */
  operator: FilterOperator;
  /** Filter value(s) */
  value: unknown;
}

export interface FilterState {
  /** Column filters */
  columnFilters: ColumnFilter[];
  /** Global search term */
  globalFilter?: string;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationState {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Number of rows per page */
  pageSize: number;
}

export interface PaginationInfo extends PaginationState {
  /** Total number of pages */
  pageCount: number;
  /** Total number of rows */
  totalRows: number;
  /** Can go to previous page */
  canPreviousPage: boolean;
  /** Can go to next page */
  canNextPage: boolean;
}

// ============================================
// SELECTION TYPES
// ============================================

export interface RowSelection {
  /** Map of row ID to selected state */
  [rowId: string]: boolean;
}

export interface SelectionState {
  /** Currently selected rows */
  rowSelection: RowSelection;
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable multi-select */
  enableMultiRowSelection?: boolean;
  /** Enable select all */
  enableSelectAll?: boolean;
}

// ============================================
// MAIN GRID OPTIONS
// ============================================

export interface TailGridOptions<TData> {
  /** Data array */
  data: TData[];
  /** Column definitions */
  columns: TailGridColumn<TData>[];

  // Sorting
  /** Enable sorting */
  enableSorting?: boolean;
  /** Initial sort state */
  initialSorting?: SortingState;
  /** Enable multi-column sorting */
  enableMultiSort?: boolean;
  /** Callback when sorting changes */
  onSortingChange?: (sorting: SortingState) => void;

  // Filtering
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Initial filter state */
  initialFilters?: FilterState;
  /** Enable global filter */
  enableGlobalFilter?: boolean;
  /** Callback when filters change */
  onFiltersChange?: (filters: FilterState) => void;

  // Pagination
  /** Enable pagination */
  enablePagination?: boolean;
  /** Initial pagination state */
  initialPagination?: PaginationState;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Callback when pagination changes */
  onPaginationChange?: (pagination: PaginationState) => void;

  // Selection
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable multi-row selection */
  enableMultiRowSelection?: boolean;
  /** Initial selection state */
  initialRowSelection?: RowSelection;
  /** Callback when selection changes */
  onRowSelectionChange?: (selection: RowSelection) => void;
  /** Get row ID for selection */
  getRowId?: (row: TData, index: number) => string;

  // Column features
  /** Enable column resizing */
  enableColumnResizing?: boolean;
  /** Enable column reordering */
  enableColumnReordering?: boolean;
  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;

  // AI features
  /** Enable AI query bar */
  enableAI?: boolean;
}

// ============================================
// GRID INSTANCE
// ============================================

export interface TailGridInstance<TData> {
  /** Get all rows */
  getRows: () => TData[];
  /** Get filtered rows */
  getFilteredRows: () => TData[];
  /** Get sorted rows */
  getSortedRows: () => TData[];
  /** Get paginated rows (current page) */
  getPaginatedRows: () => TData[];

  // Sorting
  /** Get current sorting state */
  getSorting: () => SortingState;
  /** Set sorting state */
  setSorting: (sorting: SortingState) => void;
  /** Toggle sort for a column */
  toggleSort: (columnId: string, desc?: boolean) => void;
  /** Clear all sorting */
  clearSorting: () => void;

  // Filtering
  /** Get current filter state */
  getFilters: () => FilterState;
  /** Set column filter */
  setColumnFilter: (filter: ColumnFilter) => void;
  /** Remove column filter */
  removeColumnFilter: (columnId: string) => void;
  /** Set global filter */
  setGlobalFilter: (value: string) => void;
  /** Clear all filters */
  clearFilters: () => void;

  // Pagination
  /** Get pagination info */
  getPaginationInfo: () => PaginationInfo;
  /** Go to specific page */
  setPageIndex: (index: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to last page */
  lastPage: () => void;

  // Selection
  /** Get selected row IDs */
  getSelectedRowIds: () => string[];
  /** Get selected rows */
  getSelectedRows: () => TData[];
  /** Toggle row selection */
  toggleRowSelection: (rowId: string) => void;
  /** Toggle all rows selection */
  toggleAllRowsSelection: () => void;
  /** Set row selection */
  setRowSelection: (selection: RowSelection) => void;
  /** Clear selection */
  clearSelection: () => void;

  // Columns
  /** Get column definitions */
  getColumns: () => TailGridColumn<TData>[];
  /** Get visible columns */
  getVisibleColumns: () => TailGridColumn<TData>[];
  /** Toggle column visibility */
  toggleColumnVisibility: (columnId: string) => void;
  /** Reorder columns */
  reorderColumns: (columnIds: string[]) => void;

  // Internal TanStack table instance
  /** @internal TanStack Table instance */
  _table: Table<TData>;
}

// ============================================
// AI TYPES (for @tailgrid/ai integration)
// ============================================

export interface AIQueryResult {
  /** Parsed filters */
  filters?: ColumnFilter[];
  /** Parsed sorting */
  sorting?: SortConfig[];
  /** Raw query */
  query: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Error if parsing failed */
  error?: string;
}

export interface AIProviderConfig {
  /** Provider type */
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  /** API key (for cloud providers) */
  apiKey?: string;
  /** API endpoint (for custom/local providers) */
  endpoint?: string;
  /** Model name */
  model?: string;
}
