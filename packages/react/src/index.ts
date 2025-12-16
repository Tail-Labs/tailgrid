// Components
export { TailGrid } from './components/TailGrid';
export type { TailGridProps } from './components/TailGrid';

// Hooks
export { useTailGrid } from './hooks/useTailGrid';
export type { UseTailGridReturn } from './hooks/useTailGrid';

// Re-export core types
export type {
  TailGridOptions,
  TailGridColumn,
  TailGridInstance,
  CellContext,
  SortDirection,
  SortConfig,
  SortingState,
  FilterOperator,
  ColumnFilter,
  FilterState,
  PaginationState,
  PaginationInfo,
  RowSelection,
  SelectionState,
  AIQueryResult,
  AIProviderConfig,
} from '@tailgrid/core';
