// ============================================
// COMPONENTS
// ============================================

export { TailGrid } from './components/TailGrid';
export { GridToolbar } from './components/GridToolbar';
export { AIQueryBar } from './components/AIQueryBar';
export { SelectionCheckbox } from './components/SelectionCheckbox';
export { ColumnResizer } from './components/ColumnResizer';
export { VirtualizedBody } from './components/VirtualizedBody';
export { ColumnFilter as ColumnFilterDropdown } from './components/ColumnFilter';

// ============================================
// HOOKS
// ============================================

export { useTailGrid } from './hooks/useTailGrid';
export { useVirtualization } from './hooks/useVirtualization';
export { useAIQuery } from './hooks/useAIQuery';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
export { useAccessiblePrimitives } from './hooks/useAccessiblePrimitives.js';

// ============================================
// TYPES
// ============================================

export type {
  TailGridProps,
  TailGridRenderContext,
  UseTailGridReturn,
  UseAIQueryOptions,
  UseAIQueryReturn,
  UseColumnResizeOptions,
  UseColumnResizeReturn,
  UseKeyboardNavigationOptions,
  UseKeyboardNavigationReturn,
} from './types';

export {
  defaultClassNames,
  mergeClassNames,
  cx,
} from './types';

// Re-export core types for convenience
export type {
  TailGridOptions,
  TailGridColumn,
  TailGridInstance,
  TailGridClassNames,
  TailGridAriaLabels,
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
  AIQueryBarConfig,
  AIQueryBarMode,
  ThemeConfig,
  ThemeMode,
  A11yConfig,
} from '@tailgrid/core';
