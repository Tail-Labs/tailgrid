import type { GridEngine } from './engine';

// ============================================
// CORE TYPES
// ============================================

export type SortDirection = 'asc' | 'desc';

/**
 * TailGrid column definition
 *
 * @example
 * ```ts
 * const columns: TailGridColumn<User>[] = [
 *   { id: 'name', header: 'Name', accessorKey: 'name' },
 *   { id: 'email', header: 'Email', accessorKey: 'email', enableSorting: true },
 * ];
 * ```
 */
export interface TailGridColumn<TData> {
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
  /** Custom cell renderer (receives TailGrid CellContext) */
  cell?: (props: CellContext<TData>) => unknown;
  /** Column data type (for AI parsing) */
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  /** Column meta information */
  meta?: Record<string, unknown>;
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

/** Sorting state type */
export type SortingState = Array<{ id: string; desc: boolean }>;

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
// REMOTE DATA TYPES
// ============================================

/**
 * Simple configuration for remote data loading
 *
 * @example
 * ```tsx
 * // Basic remote pagination
 * <TailGrid
 *   remote={{
 *     url: 'https://api.example.com/users',
 *     pageSize: 20,
 *   }}
 *   columns={columns}
 * />
 *
 * // With custom field mapping
 * <TailGrid
 *   remote={{
 *     url: 'https://api.example.com/users',
 *     pageSize: 10,
 *     responseDataKey: 'results',
 *     responseTotalKey: 'total',
 *   }}
 *   columns={columns}
 * />
 * ```
 */
export interface RemoteDataConfig {
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
}

export interface RemoteRequestParams {
  page: number;
  pageSize: number;
  sorting?: SortingState;
  filters?: ColumnFilter[];
  globalFilter?: string;
}

export interface RemoteDataState {
  /** Is data loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Total number of records (from server) */
  totalRows: number;
}

// ============================================
// MAIN GRID OPTIONS
// ============================================

export interface TailGridOptions<TData> {
  /** Data array (for local data) */
  data: TData[];
  /** Column definitions */
  columns: TailGridColumn<TData>[];
  /** Remote data configuration (optional - use instead of `data` for server-side) */
  remote?: RemoteDataConfig;

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

  // Internal grid engine instance
  /** @internal GridEngine instance */
  _engine: GridEngine<TData>;
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

// ============================================
// AI QUERY BAR CONFIGURATION
// ============================================

export type AIQueryBarMode = 'visible' | 'toggle' | 'hidden';

export interface AIQueryBarConfig {
  /** Display mode for the AI query bar */
  mode: AIQueryBarMode;
  /** Placeholder text */
  placeholder?: string;
  /** Keyboard shortcut (e.g., 'mod+k' for Cmd/Ctrl+K) */
  shortcut?: string;
  /** Show suggestions based on column schema */
  showSuggestions?: boolean;
  /** Maximum suggestions to display */
  maxSuggestions?: number;
}

// ============================================
// THEME CONFIGURATION
// ============================================

export type ThemeMode = 'plain' | 'tailwind' | 'unstyled';

export interface ThemeConfig {
  /** Styling approach */
  mode: ThemeMode;
  /** Enable dark mode */
  darkMode?: boolean;
  /** Custom CSS class overrides */
  customClasses?: Partial<TailGridClassNames>;
}

/** CSS class names for all TailGrid elements */
export interface TailGridClassNames {
  /** Root container */
  container: string;
  /** Table wrapper */
  tableWrapper: string;
  /** Table element */
  table: string;
  /** Table header */
  thead: string;
  /** Header row */
  headerRow: string;
  /** Header cell */
  th: string;
  /** Sortable header cell */
  thSortable: string;
  /** Sort indicator */
  sortIndicator: string;
  /** Table body */
  tbody: string;
  /** Body row */
  row: string;
  /** Selected row */
  rowSelected: string;
  /** Hovered row */
  rowHover: string;
  /** Body cell */
  td: string;
  /** Toolbar container */
  toolbar: string;
  /** Global search input */
  searchInput: string;
  /** AI query bar */
  aiBar: string;
  /** AI query input */
  aiInput: string;
  /** AI loading indicator */
  aiLoading: string;
  /** AI error message */
  aiError: string;
  /** Pagination container */
  pagination: string;
  /** Pagination button */
  paginationButton: string;
  /** Pagination info */
  paginationInfo: string;
  /** Page size select */
  pageSizeSelect: string;
  /** Column resizer handle */
  resizer: string;
  /** Column resizer active */
  resizerActive: string;
  /** Filter popover */
  filterPopover: string;
  /** Filter chip */
  filterChip: string;
  /** Checkbox */
  checkbox: string;
  /** Checkbox checked */
  checkboxChecked: string;
  /** Checkbox indeterminate */
  checkboxIndeterminate: string;
  /** Loading overlay */
  loading: string;
  /** Empty state */
  empty: string;
}

// ============================================
// ACCESSIBILITY CONFIGURATION
// ============================================

export interface A11yConfig {
  /** Enable accessible UI primitives (lazy-loads Radix UI) */
  enableAccessiblePrimitives?: boolean;
  /** Announce changes to screen readers */
  announceChanges?: boolean;
  /** Enable keyboard navigation */
  enableKeyboardNavigation?: boolean;
  /** Custom ARIA labels */
  ariaLabels?: Partial<TailGridAriaLabels>;
}

/** ARIA labels for accessibility */
export interface TailGridAriaLabels {
  /** Table label */
  table: string;
  /** Sort ascending */
  sortAscending: string;
  /** Sort descending */
  sortDescending: string;
  /** Clear sort */
  clearSort: string;
  /** Filter column */
  filterColumn: string;
  /** Clear filter */
  clearFilter: string;
  /** Select row */
  selectRow: string;
  /** Select all rows */
  selectAllRows: string;
  /** Go to first page */
  firstPage: string;
  /** Go to previous page */
  previousPage: string;
  /** Go to next page */
  nextPage: string;
  /** Go to last page */
  lastPage: string;
  /** AI query bar */
  aiQueryBar: string;
  /** Global search */
  globalSearch: string;
}
