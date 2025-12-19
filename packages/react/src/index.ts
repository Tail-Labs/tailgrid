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
export {
  ThemeProvider,
  ThemeToggle,
  ThemeSelector,
  useThemeContext,
} from './components/ThemeProvider';

// ============================================
// HOOKS
// ============================================

export { useTailGrid } from './hooks/useTailGrid';
export { useVirtualization } from './hooks/useVirtualization';
export { useAIQuery } from './hooks/useAIQuery';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
export { useAccessiblePrimitives } from './hooks/useAccessiblePrimitives.js';
export { useTheme, defineTheme, lightTheme, darkTheme } from './hooks/useTheme';
export { useRemoteData } from './hooks/useRemoteData';
export { useTailGridQuery, createFetchFn } from './hooks/useTailGridQuery';

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

export type {
  RemoteGridConfig,
  FetchParams,
  FetchResult,
  UseTailGridQueryReturn,
  UrlFetchConfig,
} from './hooks/useTailGridQuery';

export {
  defaultClassNames,
  emptyClassNames,
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
  RemoteDataConfig,
  RemoteRequestParams,
  RemoteDataState,
  AIQueryResult,
  AIProviderConfig,
  AIQueryBarConfig,
  AIQueryBarMode,
  ThemeConfig,
  ThemeMode,
  A11yConfig,
} from '@tailgrid/core';
