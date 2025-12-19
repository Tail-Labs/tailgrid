// Core
export { createTailGrid } from './createTailGrid';

// Engine
export { GridEngine } from './engine';
export type { GridEngineOptions, GridEngineState } from './engine';
export type { GridRow, GridCell } from './engine/models/RowModel';
export type { GridColumn } from './engine/models/ColumnModel';

// Theme Engine
export {
  ThemeEngine,
  themeEngine,
  createThemeEngine,
  defineTheme,
  lightTheme,
  darkTheme,
  presetThemes,
} from './theme';
export type {
  ThemeConfig as TailGridThemeConfig,
  PartialThemeConfig,
  ThemeColors,
  ThemeSpacing,
  ThemeRadius,
  ThemeShadows,
  ThemeTypography,
  ThemeTransitions,
} from './theme';

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

  // Remote Data
  RemoteDataConfig,
  RemoteRequestParams,
  RemoteDataState,

  // AI
  AIQueryResult,
  AIProviderConfig,
  AIQueryBarConfig,
  AIQueryBarMode,

  // Theming (legacy)
  ThemeConfig,
  ThemeMode,
  TailGridClassNames,

  // Accessibility
  A11yConfig,
  TailGridAriaLabels,
} from './types';
