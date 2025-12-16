// Core
export { createTailGrid } from './createTailGrid';

// Types
export type {
  // Core types
  TailGridOptions,
  TailGridInstance,
  TailGridColumn,
  CellContext,
  SortDirection,

  // Sorting
  SortConfig,
  SortingState,

  // Filtering
  FilterOperator,
  ColumnFilter,
  FilterState,

  // Pagination
  PaginationState,
  PaginationInfo,

  // Selection
  RowSelection,
  SelectionState,

  // AI
  AIQueryResult,
  AIProviderConfig,
  AIQueryBarConfig,
  AIQueryBarMode,

  // Theming
  ThemeConfig,
  ThemeMode,
  TailGridClassNames,

  // Accessibility
  A11yConfig,
  TailGridAriaLabels,
} from './types';
