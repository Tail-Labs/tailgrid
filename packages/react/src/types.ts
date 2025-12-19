import type { ReactNode } from 'react';
import type {
  TailGridOptions,
  TailGridColumn,
  TailGridClassNames,
  AIQueryBarConfig,
  AIQueryBarMode,
  AIQueryResult,
  ThemeConfig,
  A11yConfig,
  SortingState,
  FilterState,
  RowSelection,
  PaginationInfo,
  GridRow,
  GridColumn,
  ColumnFilter,
} from '@tailgrid/core';
import type { AIProvider } from '@tailgrid/ai';

// ============================================
// TAILGRID REACT PROPS
// ============================================

export interface TailGridProps<TData> extends TailGridOptions<TData> {
  // ─────────────────────────────────────────
  // Styling
  // ─────────────────────────────────────────
  /** Custom class name for the grid container */
  className?: string;
  /** Custom CSS class overrides for all elements */
  classNames?: Partial<TailGridClassNames>;
  /** Theme preset */
  theme?: 'default' | 'dark' | 'none';

  // ─────────────────────────────────────────
  // Pagination (shortcuts)
  // ─────────────────────────────────────────
  /** Initial page size (shorthand for initialPagination.pageSize) */
  pageSize?: number;

  // ─────────────────────────────────────────
  // Layout / Sizing
  // ─────────────────────────────────────────
  /** Fixed height of the grid (e.g., 500, '500px', '80vh') */
  height?: number | string;
  /** Maximum height of the grid */
  maxHeight?: number | string;
  /** Minimum height of the grid */
  minHeight?: number | string;
  /** Auto-resize to fill available space in parent container */
  autoResize?: boolean;

  // ─────────────────────────────────────────
  // UI State
  // ─────────────────────────────────────────
  /** Show loading state */
  loading?: boolean;
  /** Empty state message or component */
  emptyMessage?: ReactNode;
  /** Loading state message or component */
  loadingMessage?: ReactNode;

  // ─────────────────────────────────────────
  // Virtualization / Infinite Scroll
  // ─────────────────────────────────────────
  /** Enable virtual scrolling for large datasets */
  enableVirtualization?: boolean;
  /** Height of the virtualized container */
  virtualHeight?: number | string;
  /** Estimated row height for virtualization */
  rowHeight?: number;
  /** Overscan count (rows to render outside visible area) */
  overscan?: number;
  /** Enable infinite scrolling */
  enableInfiniteScroll?: boolean;
  /** Callback when scroll reaches near end */
  onLoadMore?: () => void;
  /** Whether more data is being loaded */
  isLoadingMore?: boolean;
  /** Whether there are more items to load */
  hasMore?: boolean;

  // ─────────────────────────────────────────
  // AI Features
  // ─────────────────────────────────────────
  /** AI provider instance */
  aiProvider?: AIProvider;
  /** AI query bar display mode */
  aiQueryBarMode?: AIQueryBarMode;
  /** AI query bar configuration */
  aiQueryBarConfig?: Partial<AIQueryBarConfig>;
  /** Callback when AI query is executed */
  onAIQuery?: (result: AIQueryResult) => void;

  // ─────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────
  /** Enable accessible UI primitives (lazy-loads Radix UI) */
  enableAccessiblePrimitives?: boolean;
  /** Enable keyboard navigation */
  enableKeyboardNavigation?: boolean;
  /** Accessibility configuration */
  a11yConfig?: Partial<A11yConfig>;

  // ─────────────────────────────────────────
  // Custom Rendering
  // ─────────────────────────────────────────
  /** Render custom header cell */
  renderHeaderCell?: (column: TailGridColumn<TData>) => ReactNode;
  /** Render custom body cell */
  renderCell?: (value: unknown, row: TData, column: TailGridColumn<TData>) => ReactNode;
  /** Render custom toolbar */
  renderToolbar?: (grid: TailGridRenderContext<TData>) => ReactNode;
  /** Render custom pagination */
  renderPagination?: (grid: TailGridRenderContext<TData>) => ReactNode;
  /** Render custom empty state */
  renderEmpty?: () => ReactNode;
  /** Render custom loading state */
  renderLoading?: () => ReactNode;
}

// ============================================
// RENDER CONTEXT (passed to custom renderers)
// ============================================

export interface TailGridRenderContext<TData> {
  /** Row model from grid engine */
  rowModel: GridRow<TData>[];
  /** Column model from grid engine */
  gridColumns: GridColumn<TData>[];

  // Sorting
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  toggleSort: (columnId: string, multi?: boolean) => void;
  clearSorting: () => void;

  // Filtering
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  columnFilters: ColumnFilter[];
  setColumnFilter: (columnId: string, value: unknown) => void;
  clearFilters: () => void;

  // Pagination
  paginationInfo: PaginationInfo;
  pagination: { pageIndex: number; pageSize: number };
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;

  // Selection
  selectedRows: TData[];
  rowSelection: RowSelection;
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

  // Data
  rows: TData[];
  columns: TailGridColumn<TData>[];

  // AI
  aiQuery?: (query: string) => Promise<AIQueryResult | undefined>;
  aiLoading?: boolean;
  aiError?: string | null;
}

// ============================================
// HOOK RETURN TYPES
// ============================================

export interface UseTailGridReturn<TData> extends Omit<TailGridRenderContext<TData>, 'aiQuery' | 'aiLoading' | 'aiError'> {
  /** Column definitions */
  columnDefs: TailGridColumn<TData>[];
}

export interface UseAIQueryOptions<TData> {
  /** AI provider instance */
  provider: AIProvider;
  /** Column definitions (for schema generation) */
  columns: TailGridColumn<TData>[];
  /** Callback when query result is ready */
  onResult?: (result: AIQueryResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseAIQueryReturn {
  /** Execute AI query */
  query: (input: string) => Promise<AIQueryResult>;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Last result */
  result: AIQueryResult | null;
  /** Clear error */
  clearError: () => void;
}

export interface UseColumnResizeOptions {
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Callback when resize starts */
  onResizeStart?: (columnId: string) => void;
  /** Callback when resize ends */
  onResizeEnd?: (columnId: string, width: number) => void;
}

export interface UseColumnResizeReturn {
  /** Column widths */
  columnWidths: Record<string, number>;
  /** Start resizing a column */
  startResize: (columnId: string, startX: number) => void;
  /** Update resize position */
  updateResize: (currentX: number) => void;
  /** End resizing */
  endResize: () => void;
  /** Currently resizing column ID */
  resizingColumn: string | null;
  /** Reset column to auto width */
  resetColumnWidth: (columnId: string) => void;
}

export interface UseKeyboardNavigationOptions {
  /** Enable wrap-around navigation */
  wrapAround?: boolean;
  /** Custom key handlers */
  customHandlers?: Record<string, (event: KeyboardEvent) => void>;
}

export interface UseKeyboardNavigationReturn {
  /** Currently focused cell */
  focusedCell: { rowIndex: number; columnIndex: number } | null;
  /** Set focused cell */
  setFocusedCell: (rowIndex: number, columnIndex: number) => void;
  /** Handle keyboard event */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Clear focus */
  clearFocus: () => void;
}

// ============================================
// DEFAULT CLASS NAMES
// ============================================

export const defaultClassNames: TailGridClassNames = {
  container: 'tailgrid',
  tableWrapper: 'tailgrid-table-wrapper',
  table: 'tailgrid-table',
  thead: 'tailgrid-thead',
  headerRow: 'tailgrid-header-row',
  th: 'tailgrid-th',
  thSortable: 'tailgrid-th-sortable',
  sortIndicator: 'tailgrid-sort-indicator',
  tbody: 'tailgrid-tbody',
  row: 'tailgrid-row',
  rowSelected: 'tailgrid-row-selected',
  rowHover: 'tailgrid-row-hover',
  td: 'tailgrid-td',
  toolbar: 'tailgrid-toolbar',
  searchInput: 'tailgrid-search-input',
  aiBar: 'tailgrid-ai-bar',
  aiInput: 'tailgrid-ai-input',
  aiLoading: 'tailgrid-ai-loading',
  aiError: 'tailgrid-ai-error',
  pagination: 'tailgrid-pagination',
  paginationButton: 'tailgrid-pagination-btn',
  paginationInfo: 'tailgrid-pagination-info',
  pageSizeSelect: 'tailgrid-page-size-select',
  resizer: 'tailgrid-resizer',
  resizerActive: 'tailgrid-resizer-active',
  filterPopover: 'tailgrid-filter-popover',
  filterChip: 'tailgrid-filter-chip',
  checkbox: 'tailgrid-checkbox',
  checkboxChecked: 'tailgrid-checkbox-checked',
  checkboxIndeterminate: 'tailgrid-checkbox-indeterminate',
  loading: 'tailgrid-loading',
  empty: 'tailgrid-empty',
};

/** Empty class names for theme="none" - allows full custom styling */
export const emptyClassNames: TailGridClassNames = {
  container: '',
  tableWrapper: '',
  table: '',
  thead: '',
  headerRow: '',
  th: '',
  thSortable: '',
  sortIndicator: '',
  tbody: '',
  row: '',
  rowSelected: '',
  rowHover: '',
  td: '',
  toolbar: '',
  searchInput: '',
  aiBar: '',
  aiInput: '',
  aiLoading: '',
  aiError: '',
  pagination: '',
  paginationButton: '',
  paginationInfo: '',
  pageSizeSelect: '',
  resizer: '',
  resizerActive: '',
  filterPopover: '',
  filterChip: '',
  checkbox: '',
  checkboxChecked: '',
  checkboxIndeterminate: '',
  loading: '',
  empty: '',
};

// ============================================
// UTILITY TYPES
// ============================================

/** Merge default class names with custom overrides */
export function mergeClassNames(
  defaults: TailGridClassNames,
  overrides?: Partial<TailGridClassNames>
): TailGridClassNames {
  if (!overrides) return defaults;
  return { ...defaults, ...overrides };
}

/** Get class name with optional additional classes */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
